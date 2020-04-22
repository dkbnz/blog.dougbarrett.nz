---
title: Squeezing every last drop out of a free Google compute instance.
---

TL;DR
- Ran out of RAM on an f1-micro instance
- Decreased application and database RAM Usage
- Implemented a swapfile

A few months ago, I started a small project to experiment with VueJs and Spring Boot and decided to host a demo version of it. I didn't want to spend money on hosting, yet the project needed more flexibility than what a standard free webhost would provide. This prompted me to find free a VPS/VM instance. I eventually landed on the [GCP Free Tier](https://cloud.google.com/free) page.

Google offers a variety of it's cloud platform services absolutely *free*.
They aren't the only cloud provider doing this, almost every major PaaS provider has a handful of it's services free. Their intention is to tie you to their ecosystem, so that after the trial ends - or when you run out of the free resource, you pay for more resource.

I started hosting my project, [Qlive](https://github.com/dkbarrett/Qlive/), on the f1-micro instance they provide free of charge. The specs weren't anything to weren't anything to write home about.
- 1 x shared vCPU (0.2 of a vCPU, up to 1 vCPU available for short periods of bursting)
- 600MB RAM
- 5GB of snapshot storage
- 30GB of HDD persistent disk

Initially, the app was packaged as a plain old jar file using an embedded H2 database for storage. The operating system on the VM was Debian. This ran fine for a couple of months until I decided to automate deployment.

The OS was changed from Debian to Google's Container-Optimized OS. I dockerized the application, spun up a private docker registry on the instance and created a compose file for Qlive. The compose file used [watchtower](https://github.com/containrrr/watchtower) to monitor the registry and pull the latest version whenever the application was updated. By using GitHub actions (and a workflow file), the application was automatically built, containerized and pushed to the registry after any commit to master. This worked exactly as expected (eventually).

Anyone who has worked with docker knows that containers are supposed to be ephemeral. As I mentioned before, the data was stored in an embedded H2 database. Upon every new pull of the image, the database would be wiped. I could have linked a volume to maintain the data between images but that seemed like a temporary solution. Simply put, this was not scalable, and although I don't expect it to take off (it's not exactly revolutionary) part of my intention behind creating it was to practice creating applications that can scale. The decision was made to fetch application data from a MySQL database.

### Problem
With the database up and running, it only took a handful of requests before the application would grind to a halt and start killing processes at an attempt to free up memory.

A quick analysis of the memory use of each container revealed what I suspected.
```bash
user@host ~ $ docker stats
NAME              CPU %    MEM USAGE / LIMIT     MEM %
qlive             0.10%    189.4MiB / 583.8MiB   32.44%
watchtower        0.00%    4.672MiB / 583.8MiB   0.80%
qlive_db          0.04%    180.23MiB / 583.8MiB  30.87%
docker-registry   0.00%    7.734MiB / 583.8MiB   1.32%
nginx-proxy-le    0.10%    5.137MiB / 583.8MiB   0.88%
nginx-proxy-gen   0.09%    2.598MiB / 583.8MiB   0.44%
nginx-proxy       0.00%    3.25MiB / 583.8MiB    0.56%
```

The total used RAM from the containers was ~390 MiB at idle. Once the system overhead was included (incl. docker and ssh daemon), it was easily hitting the limit and resulted in killed processes.

Something had to give.

### Thought Process

This is the point where someone who is not as resourceful (read: cheap) as I am would fork out for an upgrade. However, as it is something that I don't expect to recieve much traffic, this was not an option for me. These were the few solutions that I initially thought of.
- **Add support to the application for Google [firestore](https://cloud.google.com/firestore)**

Also apart of their free tier, Google offers 1 GB of storage on their NoSQL database product, firestore.
This permits 50,000 reads, 20,000 writes, 20,000 deletes per day.

This was likely the most time intensive process, and had I have known that the VM was going to run out of memory *before* I added MySQL support, this would have been my chosen solution. However, I felt that implementing firestore support was more effort than what it's worth, especially when considering other options.  

- **Host the MySQL database externally, using another cloud provider, on another free instance.**

As I said before, many cloud providers have free trials. This was one that I was leaning heavily toward, but I wanted to try keep it all in a single VM for now. Which would allow me to use the other trials for other projects.

- **Decrease the memory that the application and database uses**

This was what I decided to go with. I figured that even if I don't save enough memory to make a difference, I would learn some transferrable skills in the process.

### Solution

As we can see above, the application and the database use far more than the registry, proxy and watchtower.

MySQL was given a custom configuration.

```yaml
[mysqld]
query_cache_size=0
max_connections=10
key_buffer_size=8
thread_cache_size=0
host_cache_size=0

# Per thread or per operation settings
thread_stack=131072
sort_buffer_size=32K
read_buffer_size=8200
read_rnd_buffer_size=8200
max_heap_table_size=16K
tmp_table_size=1K
bulk_insert_buffer_size=0
join_buffer_size=128
net_buffer_length=1K

table_definition_cache=400
performance_schema=0
```

Some JVM options were added to the entrypoint for the Qlive container.

- `-XX:+UseSerialGC` Perform garbage collection inline with the thread allocating the heap memory instead of a dedicated GC thread(s)
- `-Xss512k` Limit each threads stack memory to 512KB (default 1MB)
- `XX:MaxRAM=100m` Restrict the JVM's calculations for the heap and non heap managed memory to be within the limits of this value.

MySQL configuration modifications resulted in a decrease of ~130MiB. Qlive seen a much smaller decrease of ~30MiB.

```bash
user@host ~ $ docker stats
NAME              CPU %    MEM USAGE / LIMIT     MEM %
qlive             0.18%    160.7MiB / 583.8MiB   27.52%
watchtower        0.81%    5.09MiB / 583.8MiB    0.87%
qlive_db          0.06%    43.99MiB / 583.8MiB   7.54%
docker-registry   0.01%    7.777MiB / 583.8MiB   1.33%
nginx-proxy-le    0.09%    6.828MiB / 583.8MiB   1.17%
nginx-proxy-gen   0.12%    6.148MiB / 583.8MiB   1.05%
nginx-proxy       0.00%    3.238MiB / 583.8MiB   0.55%
```

These savings allowed for everything to get up and running in the mean time but I have a few features in mind that would result in memory issues as soon as they were implemented. *I needed more memory.*

Looking at the total memory use using `free -m` revealed something I should have thought of earlier: *there was no swap*.
I added the following few lines of code to the startup script of my VM which gave me a 1GB swapfile. This alleviated all memory issues immediately.

```bash
#! /bin/bash
sysctl vm.disk_based_swap=1 # Allow swapfiles on the vm
fallocate -l 1G /var/swapfile # Create the swapfile
chmod 600 /var/swapfile # Only add read/write permissions
mkswap /var/swapfile # Prepare file to be used as swap partition
swapon /var/swapfile # Enable swap
sysctl vm.swappiness=20 # Allocate 20% of memory to the swapfile, unless absolutely necessary
```

Obviously this is not the most elegant solution, especially considering the swapfile is on a standard HDD. However, it prevents the machine from grinding to a halt and buys a little time to implement something more permanent. Qlive lives to see another day.
