f7test = function (){
    console.log(`f7.js ready`)
    fapp.preloader.init('.preloader')

    {
        $('#filter_genres').selectize({
            delimiter: ',',
            placeholder: 'Select genres',
            persist: false,
            create: false
        });
        $('#event_date_range_custom').dateRangePicker();
        // app.router.navigate('/');app.router.home();
// Loading flag
        var allowInfinite = true;
// Last loaded index
        var lastItemIndex = $('#infi_list li').length;
// Max items to load
        var maxItems = 200;
// Append items per load
        var itemsPerLoad = 2;
        // fapp.preloader.init('.preloader')
        fapp.infiniteScroll.create($('.infinite-scroll-content'))

        $$('.infinite-scroll-content').on('infinite', function () {
            // Exit, if loading in progress
            if (!allowInfinite) return;

            // Set loading flag
            allowInfinite = false;

            // Emulate 1s loading
            setTimeout(function () {
                // Reset loading flag
                allowInfinite = true;

                if ($('#infi_list li').length >= maxItems) {
                    // Nothing more to load, detach infinite scroll events to prevent unnecessary loadings
                    app.infiniteScroll.destroy('.infinite-scroll-content');
                    // Remove preloader
                    $('.infinite-scroll-preloader').remove();
                    return;
                }

                // Generate new items HTML
                var html = '';
                for (var i = lastItemIndex; i < lastItemIndex + itemsPerLoad;i++) {
                    html += '<li>Item ' + (i+1) + '</li>';
                }
                lastItemIndex += itemsPerLoad

                // Append new items
                $('#infi_list ul').append(html);
            }, 2000);
        });

    }

}
