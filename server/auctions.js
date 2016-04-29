var Q = require('q');
var Firebase = require('firebase');
var FireRef = new Firebase('rtmg.firebaseio.com');
var currentAuctionRef = FireRef.child('currentAuction');

function deleteAuction (id){
  var ref = FireRef.child('auctions').child(id);
  return ref.set(null)
}

function endAuction(){
  var auctionData;

  function nextAuction(){
    currentAuction(null)
      .then(function(){
        return deleteAuction(auctionData.id)
      });
  }

  function transaction(){
    // Inventories Items References
    var inventoryItemBidderRef = FireRef.child('inventories').child(auctionData.bidderID).child(auctionData.itemDetails.name); // +
    var inventoryItemSellerRef  = FireRef.child('inventories').child(auctionData.sellerID).child(auctionData.itemDetails.name); // -
    // Users Balances References
    var bidderBalanceRef = FireRef.child('users').child(auctionData.bidderID).child('balance'); // -
    var sellerBalanceRef  = FireRef.child('users').child(auctionData.sellerID).child('balance'); // +

    var increaseBidderInventoryPromise = inventoryItemBidderRef.once('value')
      .then(function(snapshot){
        return inventoryItemBidderRef.set(snapshot.val()+auctionData.quantityAuctioned)
      });

    var decreaseSellerInventoryPromise = inventoryItemSellerRef.once('value')
      .then(function(snapshot){
        return inventoryItemSellerRef.set(snapshot.val()-auctionData.quantityAuctioned)
      });

    var decreaseBidderBalancePromise = bidderBalanceRef.once('value')
      .then(function(snapshot){
        return bidderBalanceRef.set(snapshot.val()-auctionData.winningBid)
      });

    var increaseBidderBalancePromise = sellerBalanceRef.once('value')
      .then(function(snapshot){
        return sellerBalanceRef.set(snapshot.val()+auctionData.winningBid)
      });

    return Q.all([
      increaseBidderInventoryPromise,
      decreaseSellerInventoryPromise,
      decreaseBidderBalancePromise,
      increaseBidderBalancePromise
    ])

  }

  currentAuction()
    .then(function(the){
      auctionData = the.auction;
      if(the.auction.bidderID !== ''){
        transaction()
          .then(function(){
            setTimeout(nextAuction, 10000)
          });
      }else{
        nextAuction();
      }
    });
}

var interval = null;
function startAuction(){
  var timerRef = currentAuctionRef.child('timeLeft');

  if(interval === null){
    function cutDownTimer (){
      timerRef.once('value')
        .then(function(snapshot){
          if(snapshot.val() === 0){
            clearInterval(interval);
            interval = null;
            endAuction();
          }else {
            return timerRef.set(snapshot.val()-1)
          }
        });
    }

    interval = setInterval(cutDownTimer, 1000);
  }
}

// Getter and Setter
function currentAuction(auction){
  var deferred = Q.defer();

  if(typeof auction === 'undefined'){
    currentAuctionRef.once('value', function(snapshot) {
      deferred.resolve({auction: snapshot.val()}); // Null || Object
    });
  }else{
    currentAuctionRef.set(auction, function(error){
      if (error) {
        deferred.reject(error);
      } else {
        deferred.resolve(auction);
      }
    });
  }

  return deferred.promise;
}

function nextQueuedAuction(){
  var deferred = Q.defer();
  var ref = FireRef.child('auctions').orderByChild('startedAt').limitToFirst(1);
  ref.once('value',function(snapshot){
    var auction = null;
    if(snapshot.val() !== null){
      var auctionObj = snapshot.val();
      for (var key in auctionObj) {
        if( auctionObj.hasOwnProperty( key ) ) {
          auction = auctionObj[key];
          auction.id = key;
        }
      }
    }
    deferred.resolve({nextAuction: auction});
  });
  return deferred.promise;
}

function setCurrentAuction(){
  currentAuction()
    .then(function(the){
      console.log('the.auction:', the.auction);
      if(the.auction === null){
        // No running auctions
        return nextQueuedAuction();
      }
    })
    .then(function(the){
      console.log('the.nextAuction:',the.nextAuction);
      if(typeof the.nextAuction !== 'undefined'){
        return currentAuction(the.nextAuction)
      }
    })
    .then(function(auction){
      if(typeof auction.id !== 'undefined'){
        startAuction();
      }
    });
}

var auctionsRef = FireRef.child('auctions').orderByChild('startedAt').limitToFirst(1);
auctionsRef.on('child_added', function(dataSnapshot){
  setCurrentAuction();
  console.log('child_added val',dataSnapshot.val());
});