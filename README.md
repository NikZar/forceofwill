Deck Tools For Force of Will TCG
===========

A WIP WebApp for managing Force of Will TCG cards.

Visit our website: http://fowtools.com

Download our iOS App: https://itunes.apple.com/us/app/fow-tools/id936234730?mt=8
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

    GET cards <--- List of all cards. Res: [ {...card fields...} , ... ]
    GET cards/:code <--- List of all cards with that code (might be more than one: ex. Ruler/J-Ruler). Res: [ {...card fields...} , ... ]
    GET cards/:code/faqs <--- List all FAQs for the specified card. Res: [ { question: "", answer: "" } , ... ]
    POST cards/:code/faqs <--- Ask a question about the specified card. Body: { question: "" }
    
FAQs

    GET faqs <--- List of all the FAQs <--- Res: [ {question: "...", answer: "..."} ]
    GET faqs/:faqid <--- Get a single FAQ <--- Res: {question: "...", answer: "..."}

DECKS

    GET decks <--- List of all public and visible decks. Res: [ {_id: "", title: "", attributes: ["Light", ... ], userId: "", userName: "" }, ... ]
    GET decks/users/:userId <--- List all public and visible deck of the specified user. Res: [ {_id: "", title: "", attributes: ["Light", ... ], userId: "", userName: "" }, ... ]
    GET decks/my <--- List all deck of the API user. Res: [ {_id: "", title: "", attributes: ["Light", ... ]}, ... ]
    GET decks/:deckId/cards <--- List all cards in a deck. Body: [{code: "", qty: 1}, ... ]
    POST decks <--- Creates a new deck. Body: [{code: "", qty: 1}, ... ]
    POST decks/:deckId/cards <--- Add cards to a deck. Body: [{code: "", qty: 1}, ... ]
    PUT decks/:deckId <--- Replace the selected deck with the input one. Body: [{code: "", qty: 1}, ... ]

BINDERS

    GET binder/cards <--- List of all binder cards of the API user. Res: [{qty: 1, ...card fields...}]
    GET binder/cards/:code <--- Number of cards with that code in the binder. Res: {qty: 2, ...card fields...}
    POST binder/cards/ <--- Add the specified card to the binder. Body: [{code: "", qty: 1}]
    DELETE binder/cards/ <--- Remove the specified card qty into the binder. Body: [{code: "", qty: 2}]
    POST binder/cards/:code <--- Delete all cards with the specified code into the binder.

USERS

    GET users <--- List of all application users. Res: [ {userId: "", userName: "", sex: "M", photoUrl:""} , ... ]
    POST users <--- Creates a user. Body: {userName: "", sex: "M", photoUrl:""}
    PUT users/:userId <--- Creates a user with the specified userId. Body: {userName: "", sex: "M", photoUrl:""}
    PUT users <--- Updates a user. Body: {userId: "", userName: "", sex: "M", photoUrl:""}

FRIENDS

    GET friends <--- List of all friends of the API user
    POST friends/ <--- Add friends to a user. Body: [{friendId: ""}, ...] 

And more to come... :bowtie:


On success every CREATE (*POST/PUT*) request responds with:

    201 Created

    Location: ... (ex. http://localhost:5000/decks/:deckId)


On success every UPDATE (*POST/PUT*) request responds with:

    200 OK

    Location: ... (ex. http://localhost:5000/decks/:deckId)

On success every DELETE request responds with:

    200 OK
    404 Document not found

If something goes wrong (hopefully not!) you will receive:

    500 Internal Server Error
