# RTMG - Auction System

![Screenshot](/readmenFiles/screenshot.png)

#### Online Demo: https://rtmg-auction-system.herokuapp.com/

#### Unlisted Youtube Video: https://youtu.be/LYxXhlHdP2w

#### test requirements: https://docs.google.com/document/d/1tY1ISFtTVFmmHfYmysQCfcOhDA2yqBM1gbq7cTmpkW0/edit?usp=sharing
 
## Local deploy

Start development server http://localhost:8080/

`gulp devServer`

Start Production server http://localhost:9090/

`gulp server`

Build for production

`gulp`

##Relevant files: 

AngularJS

- [/public/static/assets/scripts/auctions.js](/public/static/assets/scripts/auctions.js) 
- [/public/static/assets/views/auctions.html](/public/static/assets/views/auctions.html)

Node

- [/server/auctions.js](/server/auctions.js)

## FireBase DataBase Example Scheme AND Config 

```
{
  "auctions" : {
    "-KGYNnr5E8wE44CFjo_S" : {
      "bidderID" : "",
      "itemDetails" : {
        "name" : "breads"
      },
      "minimumBid" : 4,
      "quantityAuctioned" : 4,
      "sellerDetails" : {
        "balance" : 1000,
        "names" : "Romel Gomez",
        "provider" : "facebook"
      },
      "sellerID" : "facebook:10204911533563856",
      "startedAt" : 1461956329062,
      "timeLeft" : 90,
      "winningBid" : 0,
      "winningBidderDetails" : {
        "names" : ""
      }
    }
  },
  "currentAuction" : {
    "bidderID" : "twitter:192774776",
    "id" : "-KGYNnr5E8wE44CFjo_S",
    "itemDetails" : {
      "name" : "breads"
    },
    "minimumBid" : 4,
    "quantityAuctioned" : 4,
    "sellerDetails" : {
      "balance" : 1000,
      "names" : "Romel Gomez",
      "provider" : "facebook"
    },
    "sellerID" : "facebook:10204911533563856",
    "startedAt" : 1461956329062,
    "timeLeft" : 75,
    "winningBid" : 10,
    "winningBidderDetails" : {
      "balance" : 1000,
      "names" : "Prof. Romel Gomez",
      "provider" : "twitter",
      "twitterAccount" : "romelgomez07"
    }
  },
  "inventories" : {
    "facebook:10204911533563856" : {
      "breads" : 30,
      "carrots" : 18,
      "diamonds" : 1
    },
    "twitter:192774776" : {
      "breads" : 30,
      "carrots" : 18,
      "diamonds" : 1
    }
  },
  "users" : {
    "facebook:10204911533563856" : {
      "balance" : 1000,
      "names" : "Romel Gomez",
      "provider" : "facebook"
    },
    "twitter:192774776" : {
      "balance" : 1000,
      "names" : "Prof. Romel Gomez",
      "provider" : "twitter",
      "twitterAccount" : "romelgomez07"
    }
  }
}
```

##### FireBase RULES

```
{
    "rules": {
        ".read": true,
        ".write": true,
        "auctions":{
            ".indexOn": ["sellerID","startedAt"]
          }
    }
}
```

##### FireBase Authorized Domains for OAuth Redirects

`rtmg-auction-system.herokuapp.com`