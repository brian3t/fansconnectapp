window.F7LIB={
    /**
     * make a tab-link active
     * @param tablink_class
     */
    make_tablink_active: function (tablink_class = 'home'){
        $('a.tab-link').removeClass('tab-link-active')
        $('a.tab-link.' + tablink_class).addClass('tab-link-active')
        fapp.toolbar.init('.tabbar-labels')
    }
}
