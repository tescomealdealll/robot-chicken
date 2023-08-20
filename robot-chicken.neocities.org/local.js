document.addEventListener('DOMContentLoaded', function () {
    function showTab(tabId) {
        const tabContents = document.querySelectorAll('.tab-content');
        tabContents.forEach(content => {
            content.style.display = 'none';
        });

        const selectedTab = document.getElementById(tabId);
        if (selectedTab) {
            selectedTab.style.display = 'block';
        }

        const path = window.location.pathname + window.location.search;
        const newUrl = window.location.origin + path + '#' + tabId;
        window.history.pushState(null, null, newUrl);
    }

    function loadTabFromUrl() {
        const hash = window.location.hash;
        if (hash) {
            const tabId = hash.substring(1);
            showTab(tabId);
        } else {
            showTab('kits');
        }
    }

    const tabs = document.querySelectorAll('.tabs a');
    tabs.forEach(tab => {
        tab.addEventListener('click', function (e) {
            const tabName = this.getAttribute('href');
            if(tabName.includes('#'))
                e.preventDefault();
            else
                return
            const tabId = tabName.substring(1);
            showTab(tabId);
        });
    });

    loadTabFromUrl();
});
