$(function () {
  $.fn.dataTable.ext.errMode = 'none';

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
   | AJAX call for single orders
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
    $.getJSON("/getSingleOrders", {
      items : items,
      meal : $meal,
      date: $date,
      mealType: type,
      ajax : true
    },function(listOfOrdersByAddress){

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
          if (listOfOrdersByAddress[m].orderList[0].attributes) {
            addToTable += '<b>Quantity - '+listOfOrdersByAddress[m].orderList[0].singleQuantity+', '+listOfOrdersByAddress[m].orderList[0].attributes.name+'</td>';
            addToTable += '<td><b>'+listOfOrdersByAddress[m].orderList[0].attributes.container+' - '+listOfOrdersByAddress[m].orderList[0].containerType+'</b><br>';
          }
          else {
            addToTable += '<b>Quantity - '+listOfOrdersByAddress[m].orderList[0].singleQuantity+'</td>';
            addToTable += '<td><b>'+listOfOrdersByAddress[m].orderList[0]._id.container+' - '+listOfOrdersByAddress[m].orderList[0].containerType+'</b><br>';
          }
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
