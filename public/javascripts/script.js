'Use strict;'
$(function(){
    /*********FOR  MOBILE NAVBAR**********************/
    $('.mobile_nav-button').click(() => {
        $('.mobile_nav-button').hide()
        $('.mobile_nav-button_close').show()
        $('.mobile_nav-div').slideDown(500);
    }).stop(true);
    
    $('.mobile_nav-button_close').click(() => {
        $('.mobile_nav-button_close').hide();
        $('.mobile_nav-button').show();
        $('.mobile_nav-div').slideUp(500);
    }).stop(true);


    /***********TO CLOSE TO FLASH MESSAGS */

    $('.flash_button-close').click(() => {
        $('.flash_button-close').parent().hide();
    })
    
});

