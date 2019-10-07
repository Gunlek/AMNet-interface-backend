$(document).ready(() => {
    let pending_page = 1;
    let active_page = 1;
    let suspended_page = 1;
    let url = window.location.href;
    if(url.includes("?")){
        let param_str = url.split('?')[1];
        let params = {}
        param_str.split("&").forEach((param_binome) => {
            params[param_binome.split("=")[0]] = param_binome.split("=")[1];
        });
        switch(params['cat'])
        {
            case "pending":
                pending_page = params['page'];
                break;

            case "active":
                active_page = params['page'];
                break;

            case "suspended":
                suspended_page = params['page'];
                break;
        }
    }

    $('#pending #'+pending_page.toString()).addClass("active");
    $('.pending-page[page="'+(pending_page-1).toString()+'"]').css('visibility', 'visible');
    $('#active #'+active_page.toString()).addClass("active");
    $('.active-page[page="'+(active_page-1).toString()+'"]').css('visibility', 'visible');
    $('#suspended #'+suspended_page.toString()).addClass("active");
    $('.suspended-page[page="'+(suspended_page-1).toString()+'"]').css('visibility', 'visible');

    $('.pagination-link').click((e) => {
        let itemId = e.target.id;
        let page_cat = itemId.split('?')[0];
        let page_nb = itemId.split('?')[1];
        switch(page_cat){
            case "pending":
                pending_page = page_nb.toString();
                break;
            
            case "active":
                active_page = page_nb.toString();
                break;
            
            case "suspended":
                suspended_page = page_nb.toString();
                break;
        }
        
        $('#pending li').removeClass("active");
        $('#pending #'+pending_page.toString()).addClass("active");
        $('.pending-page').css('visibility', 'collapse');
        $('.pending-page[page="'+(pending_page-1).toString()+'"]').css('visibility', 'visible');

        $('#active li').removeClass("active");
        $('#active #'+active_page.toString()).addClass("active");
        $('.active-page').css('visibility', 'collapse');
        $('.active-page[page="'+(active_page-1).toString()+'"]').css('visibility', 'visible');

        $('#suspended li').removeClass("active");
        $('#suspended #'+suspended_page.toString()).addClass("active");
        $('.suspended-page').css('visibility', 'collapse');
        $('.suspended-page[page="'+(suspended_page-1).toString()+'"]').css('visibility', 'visible');

    });
});