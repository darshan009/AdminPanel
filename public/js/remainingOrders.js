$(function () {
  $.fn.dataTable.ext.errMode = 'none';

  //Date picker
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

  $('button#displaySelected').click(function(){

    $date = $('#dateSelected').val();
    $meal = $('#mealSelected').val();

    //call
    $.getJSON('/getRemainingOrdersByDate',{
      date : $date,
      meal : $meal,
      ajax : true
    }, function(results){

      var addToTable = '<div class="box box-success" id="displaySection"><div class="box-header"></div><!-- /.box-header--><div id="" class="box-body"><table id="example3" class="table table-bordered table-hover"><thead><tr><th>User</th><th>Address</th><th>Meal</th><th>Details</th><th>Container</th></tr></thead><tbody>',
          addressArray;
      for (var i=0; i<results.length; i++){
        for (var j=0; j<results[i].menu.length; j++){
          if (j == 0) {
            addToTable += '<tr><td rowspan='+results[i].menu.length+'>'+results[i].user+'</td>';
            addToTable += '<td rowspan='+results[i].menu.length+'>'+ results[i].address._id.tag +',</br>'+results[i].address._id.flatNo+',</br>'+results[i].address._id.streetAddress+',</br>'+results[i].address._id.landmark+',</br>'+results[i].address._id.pincode+'</td>';
          }
          addToTable += '<td><a href=/viewOrder/'+results[i].id+' target="_blank">'+results[i].menu[j]._id.title+'</a></td>';
          if (results[i].menu[j].attributes != null)
            addToTable += '<td>'+ results[i].menu[j].attributes.name +'</td><td>'+ results[i].menu[j].singleQuantity +'</td></tr>';
          else
            addToTable += '<td><b>Quantity - '+ results[i].menu[j].singleQuantity +'</b></td>';
          addToTable += '<td><b>'+results[i].menu[j].containerType+'</b><br>';
          if (results[i].menu[j].specialinstruction)
            addToTable += '<br /><b> Speacial Instruction - '+results[i].menu[j].specialinstruction+'</td></tr>';
          else
            addToTable += '</td></tr>';
        }
      }
      addToTable += '</tbody></table></div></div>';
      $('#displaySection').html('');
      $('#displaySection').append(addToTable);
      $('#example3').DataTable({
        "paging": false,
        "lengthChange": true,
        "searching": true,
        "ordering": false,
        "info": true,
        "autoWidth": true
      });
    })
  });
});
