// Create the module and name it printerface
// also include ngRoute for all our routing needs

var printerface = angular.module('printerface', ['ngRoute']);

printerface.run(function ($templateCache, $http) {
   $http.get('pages/largeButton.html', { cache: $templateCache });
   $http.get('pages/users.html', { cache: $templateCache });
   $http.get('pages/settings.html', { cache: $templateCache });

   VisPrinter.attach();
   VisPrinter.connect();

   //ondragstart="return false"
});

//Configure Routes
printerface.config(function($routeProvider) {
    $routeProvider
        //Homepage
        .when('/', {
            templateUrl : 'pages/largeButton.html',
            controller  : 'homeController'
        })
        //Print
        .when('/print', {
            templateUrl : 'pages/largeButton.html',
            controller  : 'printController'
        })
        //Control
        .when('/control', {
            templateUrl : 'pages/normal.html',
            controller  : 'controlController'
        })
        //Settings
        .when('/settings', {
            templateUrl : 'pages/settings.html',
            controller  : 'settingsController'
        })
        //User
        .when('/users', {
            templateUrl : 'pages/users.html',
            controller  : 'usersController'
        });
});

//Admin user control
printerface.factory('userPerm', function() {
  return {
      admin : false
  };
});

//Progress bar control
printerface.factory('progress', function() {
  return {
      preheat : "30%",
      print : "60%"
  };
});

//Home Page
printerface.controller('homeController', function($scope, progress) {
    $scope.title = 'Home';
    $scope.rights = 'EduMaker';
    $scope.errorMsg = 'EduMaker';
    $scope.preheatProgress = progress.preheat;
    $scope.printProgress = progress.print;

    $scope.icons = [
        {
            name: "Files",
            icon: "folder",
            href: "#"
        },
        {
            name: "Logout",
            icon: "arrow-left",
            href: "#users"
            //ng-click
        },
        {
            name: "Print",
            // icon: "printer",
            icon: "printer",
            href: "#print",
        },
        // {
        //     name: "Help",
        //     icon: "help_outline",
        //     href: "#print"
        // },
        {
            name: "Control",
            icon: "cursor-move",
            href: "#control"
        },
        {
            name: "Settings",
                            icon: "settings",
            //icon: "printer-settings",
            href: "#settings"
        },
    ];
    $scope.logout = function(){
        userPerm.admin = false;
    };

    function setStatus(){
        // if(!VisPrinter.connnected){
        if(true){
            VisPrinter.cmd('connect');
            VisPrinter.check();
            //return "<button class='btn' onclick='alert(\"Connecting\");VisPrinter.connect();'>Connect</button>";
        } else {
            //VisPrinter.cmd('disconnect')
            //return "<button class='btn' onclick='alert(\"Disconnecting\")'>Disconnect</button>";
        }
    }

    $scope.gcode = function(gcode, axis, distance){
        switch (gcode){
            case "print":
                console.log('Print');
                VisPrinter.print();
                break;
            case "cancel":
                console.log('Cancel');
                break;
            case "move":
                console.log('Move');
                if(axis == undefined || distance == undefined){alert("Undefined Variable in Move command");}
                    var feed = '';
                    VisPrinter.cmd('G91');
                    if(axis == 'Z') {
                            feed = '300';
                    } else {
                            feed = '3000';
                   }
                    window.setTimeout(function(){VisPrinter.cmd('G1 '+axis+distance+' F'+feed)},50);
                break;
            case "heat":
                console.log('Heat');
                break;
            case "ext":
                console.log('Extrude');
                break;
            case "":
            case undefined:
                break;
            default:
                if(gcode){
                    VisPrinter.cmd(gcode);
                }
                break;

        }

    }

    angular.element(document).ready(function () {
                    $('#console').off('input propertychange')

                    $('#console').bind('input propertychange', function(){
                            document.getElementById('settingsConsole').value = document.getElementById('console').value
                    })

        $('#connectionButtons').html(setStatus());

    })

});

//Main Print Page
printerface.controller('printController', function($scope) {
    $scope.title = 'Print';
    //$scope.html = "<div style=\"height:0px;overflow:hidden\"><input type=\"file\" id=\"fileInput\" name=\"fileInput\" accept=\".gcode\" onchange=\"alert('Upload')\" /></div>";
        $scope.icons = [
        {
            name: "Choose File",
            icon: "folder",
            href: "#print",
        },
        {
            name: "Back",
            icon: "arrow-left",
            href: "#"
        },
        {
            name: "Print",
            icon: "printer",
            href: "#print",
            gcode: "print"
        },
        {
            name: "Print History",
            icon: "restore",
            href: "#print"
        },
        {
            name: "Print Settings",
            icon: "settings",
            href: "#print"
        },
    ]

});

    //Settings Page
printerface.controller('settingsController', function($scope) {
    $scope.title = 'Settings';

        $scope.icons = [
        {
            name: "",
            icon: "blank",
            href: "#settings",
            gcode: "",
        },
        {
            name: "Back",
            icon: "arrow-left",
            href: "#"
        },
        {
            name: "Console",
                            href: "#settings"
        },
        {
            name: "",
            icon: "blank",
            href: "#settings",
            gcode: ""
        },
        {
            name: "",
            icon: "blank",
            href: "#settings",
            gcode: ""
        }
    ]

});

//Control Page
printerface.controller('controlController', function($scope) {
    $scope.title = 'Control';

        $scope.icons = [
        {
            name: "Home X + Y",
            icon: "home",
            href: "#control",
            gcode: "G28 X Y ",
        },
        {
            name: "Home Z",
            icon: "home",
            href: "#control",
            gcode: "G28 Z0"
        },
        {
            name: "Home All",
            icon: "home",
            href: "#control",
            gcode: "G28"
        },
                    {
            name: "Motors Off",
            icon: "close-circle",
            href: "#control",
            gcode: "M18",
        },
        {
            name: "Back",
            icon: "arrow-left",
            href: "#"
        },
        {
            name: "X + 10",
            icon: "chevron-right",
            href: "#control",
            gcode: "move",
            axis: "X",
            distance: "10"
        },
        {
            name: "Y - 10",
            icon: "chevron-down",
            href: "#control",
            gcode: "move",
            axis: "Y",
            distance: "-10"
        },
        {
            name: "Z + 10",
            icon: "printer",
            href: "#control",
            gcode: "move",
            axis: "Z",
            distance: "10"
        },
    ]

});

//User Control
printerface.controller('usersController', function($scope, $location, userPerm) {
    $scope.title = 'Users';

    $scope.users = [
        {
            name: "Admin",
            icon: "account",
            password: "password",
            isAdmin: true
        },
        {
            name: "Guest",
            icon: "account-outline",
        }
    ]
    $scope.login = function (user){
        if (user.password){
            var enteredPass = prompt("Please enter your password")
            if(enteredPass == user.password){
                if(user.isAdmin){
                    userPerm.admin = true;
                }
                $location.url("/")
            }
        } else {
                            $location.url("/")
                    }
    }
});