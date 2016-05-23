$(function () {
  $.fn.dataTable.ext.errMode = 'none';
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

  //non-customized
  $('button#displayMultiple').click(function(){
    $mealType = $(this).attr('category');
    $date = $('#dateSelected').val();
    $meal = $('#mealSelected').val();
    if ( !$('#mealSelected').val() )
      alert("Please Select Lunch or Dinner");
    if ( !$('#dateSelected').val() )
      alert("Please Select Date");

    //call
    $.getJSON("/getMultipleCategoryOrders", {
      meal : $meal,
      date: $date,
      ajax : true
    },function(listOfOrdersByAddresses){

      //sort for veg or non-veg
      var listOfOrdersByAddress;
      if ($mealType == undefined) {
        listOfOrdersByAddress = listOfOrdersByAddresses;
      }
      else {
        listOfOrdersByAddress = [];
        for (var z=0; z<listOfOrdersByAddresses.length; z++) {
          var categoryCount = 0;
          for (var y=0; y<listOfOrdersByAddresses[z].orderList.length; y++) {
            if (listOfOrdersByAddresses[z].orderList[y]._id.type == $mealType)
              categoryCount++;
          }
          if (categoryCount == listOfOrdersByAddresses[z].orderList.length)
            listOfOrdersByAddress.push(listOfOrdersByAddresses[z]);
        }
      }
      console.log(listOfOrdersByAddress);

      /*
       |--------------------------------------
       | sorting for similar multiple orders
       |--------------------------------------
      */
      var positions = [], sortedMultipleOrders = [];
      for (var a=0; a<listOfOrdersByAddress.length; a++) {
        for (var b=a+1; b<listOfOrdersByAddress.length; b++) {
          var foundCount = 0, similarOrderPosition = [];
          if (listOfOrdersByAddress[a].orderList.length > 1 && listOfOrdersByAddress[a].orderList.length == listOfOrdersByAddress[b].orderList.length) {
            for (var c=0; c<listOfOrdersByAddress[a].orderList.length; c++) {
              for (var d=0; d<listOfOrdersByAddress[b].orderList.length; d++) {
                if (similarOrderPosition.indexOf(d) < 0 && listOfOrdersByAddress[a].orderList[c]._id.title === listOfOrdersByAddress[b].orderList[d]._id.title) {
                  foundCount++;
                  similarOrderPosition.push(d);
                  break;
                }
              }
            }
            if (foundCount == listOfOrdersByAddress[a].orderList.length && foundCount == listOfOrdersByAddress[b].orderList.length) {
              positions.push(a);
              positions.push(b);
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
      console.log(positions);
      console.log(uniquePositions);
      //console.log(listOfOrdersByAddress);

      //now get sorted arrays
      for (var b=0; b<uniquePositions.length; b++) {
        sortedMultipleOrders.push(listOfOrdersByAddress[uniquePositions[b]]);
      }

      console.log(sortedMultipleOrders);

      /*
       |----------------------------------------
       | display similar multiple order section
       |----------------------------------------
      */
      $('#displaySimilar').html('');
      $('#displaySimilarBarcode').html('');
      //displaying of sortedMultipleOrders
      var similarDivId = 0, displayAddressArrayCounter = 0, similarDivData = [];
      for (var m=0; m<sortedMultipleOrders.length; m++) {
        //console.log(m);
        var similarCount = 0;
        for (var z=m; z<sortedMultipleOrders.length; z++) {
          //console.log(sortedMultipleOrders[m]);
          var foundCount = 0, similarOrderPosition = [];
          if (sortedMultipleOrders[m].orderList.length == sortedMultipleOrders[z].orderList.length) {
            for (var c=0; c<sortedMultipleOrders[m].orderList.length; c++) {
              for (var d=0; d<sortedMultipleOrders[z].orderList.length; d++) {
                if (similarOrderPosition.indexOf(d) < 0 &&  sortedMultipleOrders[m].orderList[c]._id.title == sortedMultipleOrders[z].orderList[d]._id.title) {
                  foundCount++;
                  similarOrderPosition.push(d);
                  break;
                }
              }
            }
            if (foundCount == sortedMultipleOrders[m].orderList.length) {
              similarCount++;
            }
          }
        }
        if (similarCount > 0) {
          var displayDivOnce = true, similarDivData = [];
          for (var y=0; y<similarCount; y++) {
            for (var i = 0; i < sortedMultipleOrders[m+y].orderList.length; i++) {
              if (displayDivOnce) {
                var addToTable = '<div id="'+similarDivId+'" class="box box-success"><div class="box-header"><h3 class="box-title">Similar Order List - <b></b></h3></div><!-- /.box-header--><div id="" class="box-body"><table id="example3" class="table table-bordered table-hover"><thead><tr><th>User</th><th>Address</th><th>Meal</th><th>Details</th><th>Container</th></tr></thead><tbody>';
                displayDivOnce = false;
              }
              if (i == 0) {
                addToTable += '<tr><td rowspan='+sortedMultipleOrders[m+y].orderList.length+'>'+ sortedMultipleOrders[m+y].user +'</td>';
                addToTable += '<td rowspan='+sortedMultipleOrders[m+y].orderList.length+'>'+ sortedMultipleOrders[m+y].address._id.tag +',</br>'+sortedMultipleOrders[m+y].address._id.flatNo+',</br>'+sortedMultipleOrders[m+y].address._id.streetAddress+',</br>'+sortedMultipleOrders[m+y].address._id.landmark+',</br>'+sortedMultipleOrders[m+y].address._id.pincode+'</td>';
                similarDivData.push(sortedMultipleOrders[m+y]);
              }
              addToTable += '<td>'+ sortedMultipleOrders[m+y].orderList[i]._id.title +'</td>';
              addToTable += '<td>';
              if (sortedMultipleOrders[m+y].orderList[i].attributes) {
                addToTable += '<b>Total Quantity - '+sortedMultipleOrders[m+y].orderList[i].singleQuantity+', '+sortedMultipleOrders[m+y].orderList[i].attributes.name+'</td>';
                addToTable += '<td><b>'+sortedMultipleOrders[m+y].orderList[i].attributes.container+' - '+sortedMultipleOrders[m+y].orderList[i].containerType+'</b><br>';
              }
              else {
                addToTable += '<b>Total Quantity - '+sortedMultipleOrders[m+y].orderList[i].singleQuantity+'</td>';
                addToTable += '<td><b>'+sortedMultipleOrders[m+y].orderList[i]._id.container+' - '+sortedMultipleOrders[m+y].orderList[i].containerType+'</b><br>';
              }
              if (sortedMultipleOrders[m+y].orderList[i].specialinstruction)
                addToTable += '<br /><b> Speacial Instruction - '+sortedMultipleOrders[m+y].orderList[i].specialinstruction+'</td></tr>';
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
          for (var i=0; i < similarDivData.length; i++) {
            orderIds.push(similarDivData[i]._id);
            containerCount = 0, displayBarcodeCount = 1;
            for (var j=0; j<similarDivData[i].orderList.length; j++) {

              //check for the number of containers, if > 6 containers for one order then print a new barcode for the order
              if (similarDivData[i].orderList[j].attributes)
                containerCount += similarDivData[i].orderList[j].attributes.container * similarDivData[i].orderList[j].singleQuantity;
              else
                containerCount += similarDivData[i].orderList[j]._id.container;
              if (containerCount > 6) {
                displayBarcodeCount++;
                containerCount = 0;
                if (similarDivData[i].orderList[j].attributes)
                  containerCount += similarDivData[i].orderList[j].attributes.container;
                else
                  containerCount += similarDivData[i].orderList[j]._id.container;
              }
            }

            //display barcodes based on the number of containers
            for (var k=0; k<displayBarcodeCount; k++) {
              addressArraySimilar.push(similarDivData[i].address._id._id);
              newDivData += '<h3><div class="invoice-info"><div class="invoice-col"><strong>'+similarDivData[i].user+'</br><p align="center">';
              newDivData += '<address>'+similarDivData[i].address._id.user+'</p><br>'+similarDivData[i].address._id.tag +',</br>'+similarDivData[i].address._id.flatNo+',</br>'+similarDivData[i].address._id.streetAddress+',</br>'+similarDivData[i].address._id.landmark+',</br>'+similarDivData[i].address._id.pincode+'</address>';
              newDivData += '<div id="bcTargetSimilar'+displayAddressArrayCounter+'"></div></div></strong></div><br></h3><hr>';
              displayAddressArrayCounter++;
            }
          }


          //now display non-similar order section since getBarcode button needs address Array from barcode section
          if (y > 1 && displayLastDiv) {
            addToTable += '</tbody></table><br /><button type="button" id="getBarcodeSimilar'+similarDivId+'" class="btn btn-info pull-right" data-address="'+addressArraySimilar+'" onclick="printBarcodeSimilar('+similarDivId+')">Get Address Barcodes</button></div></div>';
            $('#displaySimilar').append(addToTable);
            $('#example3').DataTable({
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
       |--------------------------------------------
       | display non-similar multiple order section
       |--------------------------------------------
      */
      console.log(listOfOrdersByAddress);
      $('#displaySection').html('');
      $('#displaySectionBarcode').html('');
      var nonSimilarDivData = [], addressArray = [], addressCount = 0;
      var addToTable = '<div class="box box-success"><div class="box-header"><h3 class="box-title">Multiple Category Order List</h3></div><!-- /.box-header--><div id="displaySection" class="box-body"><table id="example2" class="table table-bordered table-hover"><thead><tr><th>User</th><th>Address</th><th>Meal</th><th>Details</th><th>Container</th></tr></thead><tbody>';
      for (var m=0; m<listOfOrdersByAddress.length; m++) {
        //console.log(m);
        for (var i = 0; i < listOfOrdersByAddress[m].orderList.length; i++) {
          if (uniquePositions.indexOf(m) < 0) {
            addressArray[addressCount] = listOfOrdersByAddress[m].address._id._id;
            addressCount++;
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
      $('#example2').DataTable({
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

    })//end of ajax call
  });



  $('button#disabler').click(function(){
    var dataTagetButton = $('#example2').attr('data-targetButton');
    var CustomizedButton = $('#example2').attr('data-CustomizedButton');
    $('#example2 tbody').html('');
    $(':button[data-getButton = '+dataTagetButton+']').attr('disabled', true);
    $(':button[data-getButton = '+CustomizedButton+']').attr('disabled', true);
  });
});

//printing address
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

//displaying of barcode section
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
