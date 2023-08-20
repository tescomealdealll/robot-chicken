document.addEventListener('DOMContentLoaded', function () {
    // Function to show a tab and update the active tab in localStorage
    function showTab(tabId) {
        const tabContents = document.querySelectorAll('.tab-content');
        tabContents.forEach(content => {
            content.style.display = 'none';
        });

        const selectedTab = document.getElementById(tabId);
        if (selectedTab) {
            selectedTab.style.display = 'block';
        }

        // Store the active tab in localStorage
        localStorage.setItem('activeTab', tabId);
    }

    // Function to load the active tab from localStorage on page load
    function loadActiveTab() {
        const activeTab = localStorage.getItem('activeTab');
        if (activeTab) {
            showTab(activeTab);
        } else {
            // Default to showing a specific tab if there's no stored active tab
            showTab('tab1');
        }
    }

    // Event listener to handle tab clicks
    const tabs = document.querySelectorAll('.tabs a');
    tabs.forEach(tab => {
        tab.addEventListener('click', function (e) {
            const tabId = this.getAttribute('href').substring(1); // Remove the #
            if(tabId.includes('tab')) {
                e.preventDefault();
                showTab(tabId);
            } else {
                console.log(tabId)
            }
        });
    });

    // Load the active tab on page load
    loadActiveTab();
});
