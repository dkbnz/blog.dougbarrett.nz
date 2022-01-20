---
title: Streamlining the search for flatmates with Google Forms and Discord
---

I share a house with five other people. Although we're all on the lease equally, as I've been here the longest, I've become the de facto "head tenant"; handling interactions with the landlord and managing the bank/utility accounts.

One thing I've had to deal with over the past couple of years is the replacement of flatmates. When a flatmate moves out before the lease ends, it's up to them to find a replacement for their room. However, it's in the best interest of the remaining individuals to have a say in this as they have to interact with them on a day-to-day basis. For various reasons, we've had quite a few people move on and as a result, we have iteratively developed a process for vetting new flatmates that I'm quite proud of.

In most cases, people advertise vacancies through Facebook. While a great place to advertise, it's not the best place for receiving and managing applications. Expressions of interest come through in different formats and often with missing details. Individuals posting the advert must relay the information back to the other flatmates to discuss whether or not the person is suitable. Other difficulties involve the scheduling of viewings - who's going to be home etc.. and keeping track of discussions surrounding an individual applicant.

Our initial solution was to create a google form that contains a few open-ended questions - tell us about yourself, describe your ideal flatmate, etc. as well as the essentials such as contact details. This could then be posted alongside any adverts we distributed with a heavy emphasis on filling out the form to apply. This was a good solution and served us well for a while. All interested existing tenants were added as collaborators to see the responses and edit the questions as they saw fit. This still required a bit of effort on our behalf as we'd have to allocate time to go through the applications and arrange viewings but it was a step in the right direction. Applications now have a standard format and are in a central place. We had up to 40 applications come through this form while trying to fill a room.

We use Discord as our platform of choice for communication. It allows us to have channels for various topics - finances, shopping lists, chores, etc. There are also an endless number of bots that can be added and great developer documentation for those wanting to write their own. We use basic reminder bots for bins and chores but I decided I'd have a go at forwarding the applications from Google Forms into our Discord server. Mainly so I didn't have to manage sharing permission for the form and responses - the source of truth would be Discord.

# How to

## Prerequisites

- Google Form with questions you would like applicants to answer.
- Discord text channel where you would like the applications to be posted.

This made our process even better than we expected. Just by forwarding responses to our chat we were able to receive notifications every time a flatmate

react with emojis to indicate how we initially felt about the applicant and indicate the status of the application. Threads could be started on each response to discuss the arrangement of viewings and dive into more detail about our thoughts on the applicant. We accidentally removed the need for a discussion to vet applicants and made our process asynchronous.

# Future improvements

This is our process in its current state. I think there is more to be done. A booking platform could be incorporated to quickly arrange viewing times and automatically respond to interested applicants. It could also be made a bit more generic and packaged into a fully-fledged Discord bot so other flats can get this functionality out of the box.

I hope you enjoyed reading about my journey into "simplifying" the search for flatmates. Even more ideal would be getting my own place so I don't have to _insert funny thing about sharing space_
