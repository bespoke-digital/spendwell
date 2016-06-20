
import $ from 'jquery'

$(".toggle-dropdown").click(function(event){
  event.stopPropagation();
  $(".mui-dropdown__menu").toggle();
});

$(document).click(function(){
  $(".mui-dropdown__menu").hide();
});
