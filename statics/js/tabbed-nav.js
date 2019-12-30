// Handle tab displays and selection
$(document).ready(function() {
    $('.nav-tabs a').click(function(e) {
        e.preventDefault();
        let id = this.id;
        let activate_id = id.replace("-tab", "");
        
        
        $(".nav-tabs a").removeClass("active");
        $(this).addClass("active");
        $(".tab-content .active").fadeOut(function(){
            $(".tab-content .active").removeClass("active");
            $("#"+activate_id).fadeIn();
            $("#"+activate_id).addClass("active");
        });

    });
});