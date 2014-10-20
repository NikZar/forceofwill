Deck Tools For Force of Will TCG
===========

A WIP simple webapp for managing Force of Will TCG cards.

---- 
Development Tips
===========

  - Start the local db (eg. ulimit -n 1024 && mongod )
  - Launch the node server to enable REST APIs (eg. node web.js )
  - Compile with grunt to enable live reload (eg. grunt serve )
  - Start editing the code
  - See changes at: http://localhost:9000/dev.html
  
---- 
HTTP RESTful API Description
===========

CARDS

    GET cards <--- List of all cards
    GET cards/:code <--- List of all cards with that code (might be more than one: ex. Ruler/J-Ruler)
    GET cards/:code/faqs <--- List all FAQs for the specified card
    POST cards/:code/faqs <--- Ask a question about the specified card. Body: {question: ""}
    
FAQs

    GET faqs <--- List of all the FAQs
    GET faqs/:faqid

DECKS

    GET decks <--- List of all public and visible decks
    GET decks/:userId <--- List all public and visible deck of the specified user
    GET decks/my <--- List all deck of the API user

BINDERS

    GET binders <--- List of all binder cards of the API user
    GET binders/:code <--- Number of cards with that code in the binder
    PUT binders/:code <--- Add the specified card to the binder(count++)

USERS

    GET users <--- List of all application users

FRIENDS

    GET friends <--- List of all friends of the API user
    POST friends/:userId <---

And more to come... :bowtie:
