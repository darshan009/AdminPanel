$(function () {
  $.fn.dataTable.ext.errMode = 'none';
  //iCheck plugin for checkbox and radio inputs
  $('input[type="checkbox"].minimal, input[type="radio"].minimal').iCheck({
    checkboxClass: 'icheckbox_minimal-blue',
    radioClass: 'iradio_minimal-blue'
  });
  $('.datepicker').datepicker();



  /*
   |------------------------------
   | get todays date
   |------------------------------
  */
  var today = new Date();
  var dd = today.getDate();
  var mm = today.getMonth()+1; //January is 0!
  var yyyy = today.getFullYear();
  if(dd<10){
  dd='0'+dd
  }
  if(mm<10){
  mm='0'+mm
  }
  var today = mm+'/'+dd+'/'+yyyy;
  console.log(today);
  $('#dateSelected').val(today);


  /*
   |---------------------------------------------
   | AJAX call for retrieving items for the day
   |---------------------------------------------
  */
  $('button#getItemsForTheDay').click(function(){

    $date = $('#dateSelected').val();
    $meal = $('#mealSelected').val();

    //call
    $.getJSON("/getItemsForTheDay", {
      meal : $meal,
      date: $date,
      ajax : true
    },function(itemsForTheDay){

      var addToCategories = '';
      for (var i=0; i<itemsForTheDay.length; i++) {
        addToCategories += '<div class="col-sm-6"><label><input type="checkbox" value="'+itemsForTheDay[i]._id+'" class="minimal"/>'+itemsForTheDay[i].title+'</label></div>';
      }
      $('#displayCategories').html('');
      $('#displayCategories').append(addToCategories);

      //iCheck plugin for checkbox and radio inputs
      $('input[type="checkbox"].minimal, input[type="radio"].minimal').iCheck({
        checkboxClass: 'icheckbox_minimal-blue',
        radioClass: 'iradio_minimal-blue'
      });

    });
  });


  /*
   |------------------------------
   | AJAX call for mixed orders
   |------------------------------
  */
  $('button#displaySelected').click(function(){

    //get all selected checkbox values and type
    var items = $('.minimal:checked').map(function() {
      return this.value;
    }).get();
    var type = $(this).attr('data-type');

    $date = $('#dateSelected').val();
    $meal = $('#mealSelected').val();
    if ( !$('#mealSelected').val() )
      alert("Please Select Lunch or Dinner");
    if ( !$('#dateSelected').val() )
      alert("Please Select Date");

    //call
    $.getJSON("/getSingleOrdersWithExtras", {
      meal : $meal,
      date: $date,
      ajax : true
    },function(listOfOrdersByAddresses){

      //get by category and mealType
      var listOfOrdersByAddress = [];
      for (var m=0; m<listOfOrdersByAddresses.length; m++)
        for (l=0; l<listOfOrdersByAddresses[m].orderList.length; l++)
          if (listOfOrdersByAddresses[m].orderList[l]._id.category.name != 'Extras')
            if (items.indexOf(listOfOrdersByAddresses[m].orderList[l]._id._id) > -1 && listOfOrdersByAddresses[m].orderList[l]._id.type == type)
              listOfOrdersByAddress.push(listOfOrdersByAddresses[m]);
      console.log(listOfOrdersByAddress);

      //sort listOfOrdersByAddress by similar orders
      var positions = [], sortedMixedOrders = [];
      for (var a=0; a<listOfOrdersByAddress.length; a++) {
        for (var b=a+1; b<listOfOrdersByAddress.length; b++) {
          var foundCount = 0;
          for (var c=0; c<listOfOrdersByAddress[a].orderList.length; c++) {
            for (var d=0; d<listOfOrdersByAddress[b].orderList.length; d++) {
              if (listOfOrdersByAddress[a].orderList.length == listOfOrdersByAddress[b].orderList.length) {
                if (listOfOrdersByAddress[a].orderList[c]._id.title == listOfOrdersByAddress[b].orderList[d]._id.title) {
                  foundCount++;
                }
                if (foundCount == listOfOrdersByAddress[a].orderList.length) {
                  positions.push(a);
                  positions.push(b);
                }
              }
            }
          }
        }
      }
      //get unique positions
      var uniquePositions = [];
      for (var a=0; a<positions.length; a++) {
        if (uniquePositions.indexOf(positions[a]) < 0)
          uniquePositions.push(positions[a]);
      }
      console.log(uniquePositions);
      //now get sorted arrays
      for (var b=0; b<uniquePositions.length; b++) {
        sortedMixedOrders.push(listOfOrdersByAddress[uniquePositions[b]]);
      }

      console.log(sortedMixedOrders.length);

      /*
       |--------------------------------------
       | display similar mixed order section
       |--------------------------------------
      */
      $('#displaySimilar').html('');
      $('#displaySimilarBarcode').html('');
      var similarDivId = 0, similarBarcodeDivData = [], displayAddressArrayCounter = 0;
      for (var m=0; m<sortedMixedOrders.length; m++) {
        //console.log(sortedMixedOrders[m].mixed);
        var similarCount = 0;
        for (var z=m; z<sortedMixedOrders.length; z++) {
          //console.log(sortedSimilarOrders[m]);
          if (sortedMixedOrders[m].orderList[0]._id.title == sortedMixedOrders[z].orderList[0]._id.title && sortedMixedOrders[m].orderList[1]._id.title == sortedMixedOrders[z].orderList[1]._id.title || sortedMixedOrders[m].orderList[1]._id.title == sortedMixedOrders[z].orderList[0]._id.title && sortedMixedOrders[m].orderList[0]._id.title == sortedMixedOrders[z].orderList[1]._id.title)
            similarCount++;
        }
        if (similarCount > 0) {
          var drawOnce = true;
          for (var y=0; y<similarCount; y++) {
            for (var i = 0; i < sortedMixedOrders[m+y].orderList.length; i++) {
              if (drawOnce) {
                var addToTable = '<div id="'+similarDivId+'" class="box box-success"><div class="box-header"><h3 class="box-title">Similar Order List - <b> -- '+type+'</b></h3></div><!-- /.box-header--><div id="" class="box-body"><table id="example3" class="table table-bordered table-hover"><thead><tr><th>User</th><th>Address</th><th>Meal</th><th>Details</th><th>Container</th></tr></thead><tbody>';
                drawOnce = false;
              }
              if (i == 0) {
                similarBarcodeDivData.push(sortedMixedOrders[m+y]);
                addToTable += '<tr><td rowspan='+sortedMixedOrders[m+y].orderList.length+'>'+ sortedMixedOrders[m+y].user +'</td>';
                addToTable += '<td rowspan='+sortedMixedOrders[m+y].orderList.length+'>'+ sortedMixedOrders[m+y].address._id.tag +',</br>'+sortedMixedOrders[m+y].address._id.flatNo+',</br>'+sortedMixedOrders[m+y].address._id.streetAddress+',</br>'+sortedMixedOrders[m+y].address._id.landmark+',</br>'+sortedMixedOrders[m+y].address._id.pincode+'</td>';
              }
              addToTable += '<td>'+ sortedMixedOrders[m+y].orderList[i]._id.title +'</td>';
              addToTable += '<td>';
              if (sortedMixedOrders[m+y].orderList[i].attributes) {
                addToTable += '<b>Total Quantity - '+sortedMixedOrders[m+y].orderList[i].singleQuantity+', '+sortedMixedOrders[m+y].orderList[i].attributes.name+'</td>';
                addToTable += '<td><b>'+sortedMixedOrders[m+y].orderList[i].attributes.container+' - '+sortedMixedOrders[m+y].orderList[i].containerType+'</b><br>';
              }
              else {
                addToTable += '<b>Total Quantity - '+sortedMixedOrders[m+y].orderList[i].singleQuantity+'</td>';
                addToTable += '<td><b>'+sortedMixedOrders[m+y].orderList[i]._id.container+' - '+sortedMixedOrders[m+y].orderList[i].containerType+'</b><br>';
              }
              if (sortedMixedOrders[m+y].orderList[i].specialinstruction)
                addToTable += '<br /><b> Speacial Instruction - '+sortedMixedOrders[m+y].orderList[i].specialinstruction+'</td></tr>';
              else
                addToTable += '</td></tr>';
              addToTable += '</td></tr>';
              var displayLastDiv = true;
            }
          }
          m += similarCount - 1;

          //get barcode Section ready
          var containerCount = 0, addressArraySimilar = [], displayBarcodeCount, orderIds = [],
              newDivData = '<div id="displaySimilarBarcode'+similarDivId+'" class = "box box-info"><div class = "box-header">Choose categroy</div><div class = "box-body">';
          for (var i=0; i < similarBarcodeDivData.length; i++) {
            orderIds.push(similarBarcodeDivData[i]._id);
            containerCount = 0, displayBarcodeCount = 1;
            for (var j=0; j<similarBarcodeDivData[i].orderList.length; j++) {

              //check for the number of containers, if > 6 containers for one order then print a new barcode for the order
              if (similarBarcodeDivData[i].orderList[j].attributes)
                containerCount += similarBarcodeDivData[i].orderList[j].attributes.container * similarBarcodeDivData[i].orderList[j].singleQuantity;
              else
                containerCount += similarBarcodeDivData[i].orderList[j]._id.container;
              if (containerCount > 6) {
                displayBarcodeCount++;
                containerCount = 0;
                if (similarBarcodeDivData[i].orderList[j].attributes)
                  containerCount += similarBarcodeDivData[i].orderList[j].attributes.container;
                else
                  containerCount += similarBarcodeDivData[i].orderList[j]._id.container;
              }
            }

            //display barcodes based on the number of containers
            for (var k=0; k<displayBarcodeCount; k++) {
              addressArraySimilar.push(similarBarcodeDivData[i].address._id._id);
              newDivData += '<h3><div class="invoice-info"><div class="invoice-col"><strong>'+similarBarcodeDivData[i].user+'</br><p align="center">';
              newDivData += '<address>'+similarBarcodeDivData[i].address._id.user+'</p><br>'+similarBarcodeDivData[i].address._id.tag +',</br>'+similarBarcodeDivData[i].address._id.flatNo+',</br>'+similarBarcodeDivData[i].address._id.streetAddress+',</br>'+similarBarcodeDivData[i].address._id.landmark+',</br>'+similarBarcodeDivData[i].address._id.pincode+'</address>';
              newDivData += '<div id="bcTargetSimilar'+displayAddressArrayCounter+'"></div></div></strong></div><br></h3><hr>';
              displayAddressArrayCounter++;
            }
          }


          //now display similar order section since getBarcode button needs address Array from barcode section
          if (y > 1 && displayLastDiv) {
            addToTable += '</tbody></table><br /><button type="button" id="getBarcodeSimilar'+similarDivId+'" class="btn btn-info pull-right" data-address="'+addressArraySimilar+'" onclick="printBarcodeSimilar('+similarDivId+')">Get Address Barcodes</button></div></div>';
            $('#displaySimilar').append(addToTable);
            $('#example2').DataTable({
              "paging": false,
              "lengthChange": true,
              "searching": false,
              "ordering": false,
              "info": true,
              "autoWidth": true
            });
            displayLastDiv = false;
          }

          //time to display the barcode section and hide it
          newDivData += '<br /><button id="" type="button" class="btn btn-info pull-left" onclick = "printSimilarDiv('+similarDivId+')">Print Address Barcodes list</button><button id="similarDoneButton'+similarDivId+'" class="btn btn-info pull-right" data-orderids="'+[orderIds]+'" onclick="changeOrderStatusForSimilar('+similarDivId+')">Done</button>';
          newDivData += '</div></div>';
          $('#displaySimilarBarcode').append(newDivData);
          $('#displaySimilarBarcode'+similarDivId+'').hide();
        }
        similarDivId++;
      }


      /*
       |-----------------------------------------
       | display non-similar mixed order section
       |-----------------------------------------
      */
      var nonSimilarDivData = [], addToTable;
      $('#displaySection').html('');
      $('#displaySectionBarcode').html('');
      addToTable = '<div class="box box-success"><div class="box-header"><h3 class="box-title">Mixed Order List - <b></b></h3></div><!-- /.box-header--><div id="displaySection" class="box-body"><table id="example3" class="table table-bordered table-hover"><thead><tr><th>User</th><th>Address</th><th>Meal</th><th>Details</th><th>Container</th></tr></thead><tbody>';
      for (var m=0; m<listOfOrdersByAddress.length; m++) {
        for (var i = 0; i < listOfOrdersByAddress[m].orderList.length; i++) {
          if (uniquePositions.indexOf(m) < 0) {
            if (i == 0) {
              addToTable += '<tr><td rowspan='+listOfOrdersByAddress[m].orderList.length+'>'+ listOfOrdersByAddress[m].user +'</td>';
              addToTable += '<td rowspan='+listOfOrdersByAddress[m].orderList.length+'>'+ listOfOrdersByAddress[m].address._id.tag +',</br>'+listOfOrdersByAddress[m].address._id.flatNo+',</br>'+listOfOrdersByAddress[m].address._id.streetAddress+',</br>'+listOfOrdersByAddress[m].address._id.landmark+',</br>'+listOfOrdersByAddress[m].address._id.pincode+'</td>';
              nonSimilarDivData.push(listOfOrdersByAddress[m]);
            }
            addToTable += '<td>'+ listOfOrdersByAddress[m].orderList[i]._id.title +'</td>';
            addToTable += '<td>';
            if (listOfOrdersByAddress[m].orderList[i].attributes) {
              addToTable += '<b>Quantity - '+listOfOrdersByAddress[m].orderList[i].singleQuantity+', '+listOfOrdersByAddress[m].orderList[i].attributes.name+'</td>';
              addToTable += '<td><b>'+listOfOrdersByAddress[m].orderList[i].attributes.container+' - '+listOfOrdersByAddress[m].orderList[i].containerType+'</b><br>';
            }
            else {
              addToTable += '<b>Quantity - '+listOfOrdersByAddress[m].orderList[i].singleQuantity+'</td>';
              addToTable += '<td><b>'+listOfOrdersByAddress[m].orderList[i]._id.container+' - '+listOfOrdersByAddress[m].orderList[i].containerType+'</b><br>';
            }
            if (listOfOrdersByAddress[m].orderList[i].specialinstruction)
              addToTable += '<br /><b> Speacial Instruction - '+listOfOrdersByAddress[m].orderList[i].specialinstruction+'</td></tr>';
            else
              addToTable += '</td></tr>';
            addToTable += '</td></tr>';
          }
        }
      }

      //get barcode Section ready
      var containerCount = 0, addressArray = [], displayBarcodeCount, orderIds = [], displayAddressArrayCounter = 0;
          newDivData = '<div class = "box box-info"><div class = "box-header">Choose categroy</div><div class = "box-body">';
      for (var i=0; i < nonSimilarDivData.length; i++) {
        orderIds.push(nonSimilarDivData[i]._id);
        containerCount = 0, displayBarcodeCount = 1;
        for (var j=0; j<nonSimilarDivData[i].orderList.length; j++) {

          //check for the number of containers, if > 6 containers for one order then print a new barcode for the order
          if (nonSimilarDivData[i].orderList[j].attributes)
            containerCount += nonSimilarDivData[i].orderList[j].attributes.container * nonSimilarDivData[i].orderList[j].singleQuantity;
          else
            containerCount += nonSimilarDivData[i].orderList[j]._id.container;
          if (containerCount > 6) {
            displayBarcodeCount++;
            containerCount = 0;
            if (nonSimilarDivData[i].orderList[j].attributes)
              containerCount += nonSimilarDivData[i].orderList[j].attributes.container;
            else
              containerCount += nonSimilarDivData[i].orderList[j]._id.container;
          }
        }

        //display barcodes based on the number of containers
        for (var k=0; k<displayBarcodeCount; k++) {
          addressArray.push(nonSimilarDivData[i].address._id._id);
          newDivData += '<h3><div class="invoice-info"><div class="invoice-col"><strong>'+nonSimilarDivData[i].user+'</br><p align="center">';
          newDivData += '<address>'+nonSimilarDivData[i].address._id.user+'</p><br>'+nonSimilarDivData[i].address._id.tag +',</br>'+nonSimilarDivData[i].address._id.flatNo+',</br>'+nonSimilarDivData[i].address._id.streetAddress+',</br>'+nonSimilarDivData[i].address._id.landmark+',</br>'+nonSimilarDivData[i].address._id.pincode+'</address>';
          newDivData += '<div id="bcTarget'+displayAddressArrayCounter+'"></div></div></strong></div><br></h3><hr>';
          displayAddressArrayCounter++;
        }
      }

      //now display non-similar order section since getBarcode button needs address Array from barcode section
      addToTable += '</tbody></table><br /><button id="getBarcode" type="button" class="btn btn-info pull-right" data-address='+[addressArray]+' onclick="printBarcode()">Get Address Barcode</button></div></div>';
      $('#displaySection').append(addToTable);
      $('#example3').DataTable({
        "paging": false,
        "lengthChange": true,
        "searching": false,
        "ordering": false,
        "info": true,
        "autoWidth": true
      });


      //time to display the barcode section and hide it
      newDivData += '<br /><button id="" type="button" class="btn btn-info pull-left" onclick = "printDiv()">Print order list</button><button id="nonSimilarDoneButton" class="btn btn-info pull-right" data-orderids='+[orderIds]+' onclick="changeOrderStatus()">Done</button>';
      newDivData += '</div></div>';
      $('#displaySectionBarcode').append(newDivData);
      $('#displaySectionBarcode').hide();


    });//end of ajax call
  });
});


function printSimilarDiv(x){
   var printContents = document.getElementById("displaySimilarBarcode"+x+"").innerHTML;
   var originalContents = document.body.innerHTML;
   document.body.innerHTML = printContents;
   window.print();
   document.body.innerHTML = originalContents;
}
function printDiv(){
   var printContents = document.getElementById("displaySectionBarcode").innerHTML;
   var originalContents = document.body.innerHTML;
   document.body.innerHTML = printContents;
   window.print();
   document.body.innerHTML = originalContents;
}
function printBarcode() {
  var addressArray = $('#getBarcode').data('address').split(',');
  console.log(addressArray);
  for (var i=0; i<addressArray.length; i++) {
    $("#bcTarget"+i+"").barcode(addressArray[i], "code128", {barWidth:3, barHeight:60});
  }
  $('#displaySection').hide();
  $('#displaySectionBarcode').show();
}
function printBarcodeSimilar(position) {
  var addressArray = $('#getBarcodeSimilar'+position+'').data('address').split(',');
  console.log(addressArray);
  for (var i=0; i<addressArray.length; i++) {
    $("#bcTargetSimilar"+i+"").barcode(addressArray[i], "code128", {barWidth:3, barHeight:60});
  }
  $('#'+position).hide();
  $('#displaySimilarBarcode'+position+'').show();
}

//changing order status to OUT
function changeOrderStatusForSimilar(count) {
  var orders = $('#similarDoneButton'+count+'').data('orderids').split(',');
  //call
  $.getJSON("/changeOrderStatus", {
    orders: orders,
    ajax : true
  }, function(j){
    $('#displaySimilarBarcode'+count+'').hide();
  });
}

function changeOrderStatus() {
  var orders = $('#nonSimilarDoneButton').data('orderids').split(',');
  //call
  $.getJSON("/changeOrderStatus", {
    orders: orders,
    ajax : true
  }, function(j){
    $('#displaySectionBarcode').hide();
  });
}
