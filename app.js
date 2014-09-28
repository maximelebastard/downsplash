// Constants
var APP_NAME = 'DownSplash';
var APP_VERSION = '0.0.1';
var TRAY_ICON = 'img/tray-icon.png';
var TRAY_ICON_SCRAPING = 'img/tray-icon-scraping.png';

// Initialize the settings
function checkSetting(key, defaultValue)
{
    if(typeof(localStorage.key) == undefined)
    {
        localStorage.key = defaultValue;
    }
}

function getUserHome() {
    return process.env[(process.platform == 'win32') ? 'USERPROFILE' : 'HOME'];
}

checkSetting('saveDir', getUserHome());
checkSetting('refreshDelayHours', 2);
localStorage.saveDir = '/Users/maxime/Pictures/Unsplash_test';

// Load native UI library
var gui = require('nw.gui');

// Load the window
var win = gui.Window.get();

// Create a tray icon
var tray = new gui.Tray({ icon: TRAY_ICON });

// Tray functions
var closeApp = function(){
    gui.App.quit();
};
var selectSaveDir = function(){
    LZADialog.selectDir({nwworkingdir: '/home/user'}, function(file){
        localStorage.saveDir = file.path;
    });
};
win.on('close', function(){
    this.hide();
});

// Tray Menu
var menu = new gui.Menu();
menu.append(new gui.MenuItem({ type: 'normal', label: APP_NAME + ' ' + APP_VERSION, enabled:false}));
menu.append(new gui.MenuItem({ type: 'normal', label: 'Last loading 3 minutes ago', enabled:false}));
menu.append(new gui.MenuItem({ type: 'normal', label: 'Save directory...', click: selectSaveDir }));
menu.append(new gui.MenuItem({ type: 'normal', label: 'Load last pictures', click: scrape }));
menu.append(new gui.MenuItem({ type: 'normal', label: 'Quit', click: closeApp }));
tray.menu = menu;

scrape(); // Initial scrape
var loadingJob = setInterval(function(){
    scrape();
}, localStorage.refreshDelayHours*3600*1000); // Scrape every two hours