$(function () {
  $.fn.dataTable.ext.errMode = 'none';
  //iCheck plugin for checkbox and radio inputs
  $('input[type="checkbox"].minimal, input[type="radio"].minimal').iCheck({
    checkboxClass: 'icheckbox_minimal-blue',
    radioClass: 'iradio_minimal-blue'
  });
  //datepcker plugin
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
   |------------------------------
   | AJAX call for single orders
   |------------------------------
  */
  $('button#displaySelected').click(function(){

    //get all selected checkbox values and type
    var categories = $('.minimal:checked').map(function() {
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
    $.getJSON("/getSingleOrders", {
      category : categories,
      meal : $meal,
      date: $date,
      mealType: type,
      ajax : true
    },function(listOfOrdersByAddress){

      // //sort listOfOrdersByAddress by similar orders
      // var positions = [], uniquePositions = [], sortedSimilarOrders = [];
      // for (var a=0; a<listOfOrdersByAddress.length; a++) {
      //   for (var b=a+1; b<listOfOrdersByAddress.length; b++) {
      //     if (listOfOrdersByAddress[a].orderList[0]._id.subItems.length > 0 && listOfOrdersByAddress[a].orderList[0]._id.subItems.length ==  listOfOrdersByAddress[b].orderList[0]._id.subItems.length) {
      //       var checkCount = 0;
      //       for (var i=0; i<listOfOrdersByAddress[a].orderList[0]._id.subItems.length; i++) {
      //         if (listOfOrdersByAddress[a].orderList[0]._id.subItems[i].name == listOfOrdersByAddress[b].orderList[0]._id.subItems[i].name && listOfOrdersByAddress[a].orderList[0]._id.subItems[i].quantity == listOfOrdersByAddress[b].orderList[0]._id.subItems[i].quantity) {
      //           checkCount++;
      //         }
      //       }
      //       if (checkCount == listOfOrdersByAddress[a].orderList[0]._id.subItems.length) {
      //         positions.push(a);
      //         positions.push(b);
      //       }
      //     }
      //   }
      // }
      // console.log(positions);
      // //get unique positions
      // for (var a=0; a<positions.length; a++) {
      //   if (uniquePositions.indexOf(positions[a]) < 0)
      //     uniquePositions.push(positions[a]);
      // }
      // console.log(uniquePositions);
      //
      // //now get sorted arrays of similar orders
      // for (var b=0; b<uniquePositions.length; b++) {
      //   sortedSimilarOrders.push(listOfOrdersByAddress[uniquePositions[b]]);
      // }
      // console.log(sortedSimilarOrders);
      //
      // /*
      //  |------------------------------
      //  | display similar order section
      //  |------------------------------
      // */
      // $('#displaySimilar').html('');
      // $('#displaySimilarBarcode').html('');
      // //displaying similar orders first
      // var similarDivId = 0;
      // for (var m=0; m<sortedSimilarOrders.length; m++) {
      //
      //     var similarCount = 0;
      //     for (var z=m; z<sortedSimilarOrders.length; z++) {
      //       //console.log(sortedSimilarOrders[m]);
      //       var checkCount = 0;
      //       for (var i=0; i<sortedSimilarOrders[m].orderList[0]._id.subItems.length; i++) {
      //         if (sortedSimilarOrders[m].orderList[0]._id.subItems[i].name == sortedSimilarOrders[z].orderList[0]._id.subItems[i].name && sortedSimilarOrders[m].orderList[0]._id.subItems[i].quantity == sortedSimilarOrders[z].orderList[0]._id.subItems[i].quantity) {
      //           checkCount++;
      //         }
      //       }
      //       if (checkCount == sortedSimilarOrders[z].orderList[0]._id.subItems.length) {
      //         similarCount++;
      //       }else
      //         break;
      //     }
      //     console.log(similarCount);
      //     if (similarCount > 0) {
      //       var displayDivOnce = true, similarDivData = [], addressArraySimilar = [];
      //       for (var y=0; y<similarCount; y++) {
      //         addressArraySimilar.push(sortedSimilarOrders[m+y].address._id._id);
      //         if (displayDivOnce) {
      //           var addToTable = '<div id="'+similarDivId+'" class="box box-success"><div class="box-header"><h3 class="box-title">Similar Order List - <b>'+categories+' -- '+type+'</b></h3></div><!-- /.box-header--><div id="" class="box-body"><table id="example3" class="table table-bordered table-hover"><thead><tr><th>User</th><th>Address</th><th>Meal</th><th>Details</th><th>Container</th></tr></thead><tbody>';
      //           displayDivOnce = false;
      //         }
      //         addToTable += '<tr><td>'+ sortedSimilarOrders[m+y].user +'</td>';
      //         addToTable += '<td>'+ sortedSimilarOrders[m+y].address._id.tag +',</br>'+sortedSimilarOrders[m+y].address._id.flatNo+',</br>'+sortedSimilarOrders[m+y].address._id.streetAddress+',</br>'+sortedSimilarOrders[m+y].address._id.landmark+',</br>'+sortedSimilarOrders[m+y].address._id.pincode+'</td>';
      //         addToTable += '<td>'+ sortedSimilarOrders[m+y].orderList[0]._id.item.title +'</td>';
      //         addToTable += '<td>';
      //         if (sortedSimilarOrders[m+y].orderList[0].subItems) {
      //           for (var p=0; p<sortedSimilarOrders[m+y].orderList[0].subItems._id.subItemsArray.length; p++)
      //             addToTable += ''+sortedSimilarOrders[m+y].orderList[0].subItems._id.subItemsArray[p].quantity+'-'+sortedSimilarOrders[m+y].orderList[0].subItems._id.subItemsArray[p].name+',</br>';
      //         }else if (sortedSimilarOrders[m+y].orderList[0]._id.subItems.length > 0) {
      //           for (var p=0; p<sortedSimilarOrders[m+y].orderList[0]._id.subItems.length; p++)
      //             addToTable += ''+sortedSimilarOrders[m+y].orderList[0]._id.subItems[p].quantity+'-'+sortedSimilarOrders[m+y].orderList[0]._id.subItems[p].name+',</br>';
      //         }
      //         addToTable += '<b>Total Quantity - '+sortedSimilarOrders[m+y].orderList[0].singleQuantity+'</td>';
      //         addToTable += '<td><b>'+sortedSimilarOrders[m+y].orderList[0].containerType+'</b><br>';
      //         if (sortedSimilarOrders[m+y].orderList[0].specialinstruction)
      //           addToTable += '<br /><b> Speacial Instruction - '+sortedSimilarOrders[m+y].orderList[0].specialinstruction+'</td></tr>';
      //         else
      //           addToTable += '</td></tr>';
      //         addToTable += '</td></tr>';
      //         var displayLastDiv = true;
      //         similarDivData.push(sortedSimilarOrders[m+y]);
      //       }
      //       console.log(y);
      //       m += similarCount - 1;
      //       if (y > 1 && displayLastDiv) {
      //         console.log("y is greater than 1");
      //         addToTable += '</tbody></table><br /><button type="button" id="getBarcodeSimilar'+similarDivId+'" class="btn btn-info pull-right" data-address="'+addressArraySimilar+'" onclick="printBarcodeSimilar('+similarDivId+')">Get Address Barcodes</button></div></div>';
      //         $('#displaySimilar').attr('data-CustomizedButton', $buttonDisablerId);
      //         $('#displaySimilar').append(addToTable);
      //         $('#example3').DataTable({
      //         "paging": false,
      //         "lengthChange": true,
      //         "searching": true,
      //         "ordering": false,
      //         "info": true,
      //         "autoWidth": true
      //         });
      //         displayLastDiv = false;
      //       }
      //       //barcode Section
      //       var newDivData = '<div id="displaySimilarBarcode'+similarDivId+'" class = "box box-info"><div class = "box-header">Choose categroy</div><div class = "box-body">';
      //       for (var i=0; i < similarDivData.length; i++) {
      //         newDivData += '<h3><div class="invoice-info"><div class="invoice-col"><strong>'+similarDivData[i].orderList[0]._id.item.title+'<br/><br/>'+similarDivData[i].user+'</br><p align="center">';
      //         newDivData += '<address>'+similarDivData[i].address._id.user+'</p><br>'+similarDivData[i].address._id.tag +',</br>'+similarDivData[i].address._id.flatNo+',</br>'+similarDivData[i].address._id.streetAddress+',</br>'+similarDivData[i].address._id.landmark+',</br>'+similarDivData[i].address._id.pincode+'</address>';
      //         newDivData += '<div id="bcTarget'+i+'"></div></div></strong></div><br></h3><hr>';
      //       }
      //       newDivData += '<br /><button id="" type="button" class="btn btn-info pull-left" onclick = "printSimilarDiv('+similarDivId+')">Print Address Barcodes list</button><button class="btn btn-info pull-right" data-orderids="" onclick="changeOrderStatus()">Done</button>';
      //       newDivData += '</div></div>';
      //       $('#displaySimilarBarcode').append(newDivData);
      //       $('#displaySimilarBarcode'+similarDivId+'').hide();
      //     }
      //     similarDivId++;
      // }

      /*
       |------------------------------------
       | display non-similar order section
       |------------------------------------
      */
      var nonSimilarDivData = [], addressArray = [], addressCount = 0;
      var addToTable = '<div class="box box-success" id="displaySectionNonSimilar"><div class="box-header"><h3 class="box-title"><b>Order List --'+type+'</b></h3></div><!-- /.box-header--><div id="" class="box-body"><table id="example2" class="table table-bordered table-hover"><thead><tr><th>User</th><th>Address</th><th>Meal</th><th>Details</th><th>Container</th></tr></thead><tbody>';
      for (var m=0; m<listOfOrdersByAddress.length; m++) {
        nonSimilarDivData.push(listOfOrdersByAddress[m]);
        addressArray[addressCount] = listOfOrdersByAddress[m].address._id._id;
        addressCount++;
        for (var i = 0; i < listOfOrdersByAddress[m].orderList.length; i++) {
          if (i == 0) {
            addToTable += '<tr><td>'+ listOfOrdersByAddress[m].user +'</td>';
            console.log(listOfOrdersByAddress[m].user);
            addToTable += '<td>'+ listOfOrdersByAddress[m].address._id.tag +',</br>'+listOfOrdersByAddress[m].address._id.flatNo+',</br>'+listOfOrdersByAddress[m].address._id.streetAddress+',</br>'+listOfOrdersByAddress[m].address._id.landmark+',</br>'+listOfOrdersByAddress[m].address._id.pincode+'</td>';
          }
          addToTable += '<td>'+ listOfOrdersByAddress[m].orderList[0]._id.title +'</td>';
          addToTable += '<td>';
          addToTable += '<b>Total Quantity - '+listOfOrdersByAddress[m].orderList[0].singleQuantity+'</td>';
          addToTable += '<td><b>'+listOfOrdersByAddress[m].orderList[0].containerType+'</b><br>';
          if (listOfOrdersByAddress[m].orderList[i].specialinstruction)
            addToTable += '<br /><b> Speacial Instruction - '+listOfOrdersByAddress[m].orderList[i].specialinstruction+'</td></tr>';
          else
            addToTable += '</td></tr>';
          addToTable += '</td></tr>';
        }
      }
      console.log(addressArray);
      addToTable += '</tbody></table><br /><button type="button" id="getBarcode" class="btn btn-info pull-right" data-address='+[addressArray]+' onclick="printBarcode()" ">Get Address Barcodes</button></div></div>';
      //console.log(thisDivData)
      $('#displaySection').html('');
      $('#displaySection').append(addToTable);
      $('#example2').DataTable({
        "paging": false,
        "lengthChange": true,
        "searching": true,
        "ordering": false,
        "info": true,
        "autoWidth": true
      });

      //barcode Section
      $('#displaySectionBarcode').html('');
      var orderIds = [], newDivData = '<div class = "box box-info"><div class = "box-header">Choose categroy</div><div class = "box-body">';
      for (var i=0; i < nonSimilarDivData.length; i++) {
        orderIds.push(nonSimilarDivData[i]._id);
        newDivData += '<h3><div class="invoice-info"><div class="invoice-col"><strong>'+nonSimilarDivData[i].orderList[0]._id.title+'<br/><br/>'+nonSimilarDivData[i].user+'</br><p align="center">';
        newDivData += '<address>'+nonSimilarDivData[i].address._id.user+'</p><br>'+nonSimilarDivData[i].address._id.tag +',</br>'+nonSimilarDivData[i].address._id.flatNo+',</br>'+nonSimilarDivData[i].address._id.streetAddress+',</br>'+nonSimilarDivData[i].address._id.landmark+',</br>'+nonSimilarDivData[i].address._id.pincode+'</address>';
        newDivData += '<div id="bcTarget'+i+'"></div></div></strong></div><br></h3><hr>';
      }
      newDivData += '<br /><button id="" type="button" class="btn btn-info pull-left" onclick = "printDiv()">Print order list</button><<button id="nonSimilarDoneButton" class="btn btn-info pull-right" data-orderids='+[orderIds]+' onclick="changeOrderStatus()">Done</button>';
      newDivData += '</div></div>';
      $('#displaySectionBarcode').append(newDivData);
      $('#displaySectionBarcode').hide();
    });
  });

  $('button#disabler').click(function(){
    var dataTagetButton = $('#example2').attr('data-targetButton');
    var CustomizedButton = $('#example2').attr('data-CustomizedButton');
    $('#example2 tbody').html('');
    $(':button[data-getButton = '+dataTagetButton+']').attr('disabled', true);
    $(':button[data-getButton = '+CustomizedButton+']').attr('disabled', true);
  });

});
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
  console.log(addressArray.length);
  console.log(addressArray[0]);
  for (var i=0; i<addressArray.length; i++) {
    $("#bcTarget"+i+"").barcode(addressArray[i], "code128", {barWidth:3, barHeight:60});
  }
  $('#displaySection').hide();
  $('#displaySectionBarcode').show();
}


//changing order status to OUT
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
