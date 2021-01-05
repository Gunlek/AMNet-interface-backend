$(document).ready(function(){
    $('button').click(function(e){
        if($(this).attr('data-toggle') != ""){
            e.preventDefault();
            $('#'+$(this).attr('data-toggle')).fadeIn();
        }
    });

    $('.modal').click(function(e){
        e.preventDefault();
        $(this).fadeOut();
    });

    $('.modal .modal-content').click(function(e){
        e.stopPropagation();
    });
});