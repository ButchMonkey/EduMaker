// script.js

    // create the module and name it printerface
        // also include ngRoute for all our routing needs

    var printerface = angular.module('printerface', ['ngRoute']);

    printerface.run(function ($templateCache, $http) {
        $http.get('pages/largeButton.html', { cache: $templateCache });
    });
    
    printerface.run(function ($templateCache, $http) {
        $http.get('pages/users.html', { cache: $templateCache });
    });
    
    //Configure Routes
    printerface.config(function($routeProvider) {
        $routeProvider

            //Homepage
            .when('/', {
                templateUrl : 'pages/largeButton.html',
                controller  : 'mainController'
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
    printerface.controller('mainController', function($scope, progress) {
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
                icon: "keyboard_arrow_left",
                href: "#users"
                //ng-click
            },
            {
                name: "Print",
                // icon: "printer",
                icon: "print",
                href: "#print",
            },
            // {
            //     name: "Help",
            //     icon: "help_outline",
            //     href: "#print"
            // },
            {
                name: "Control",
                icon: "open_with",
                href: "#control"
            },
            {
                name: "Settings",
                icon: "settings",
                href: "#print"
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
                return "<button class='btn' onclick='alert(\"Connecting\");VisPrinter.connect();'>Connect</button>";
            } else {
                //VisPrinter.cmd('disconnect')
                return "<button class='btn' onclick='alert(\"Disconnecting\")'>Disconnect</button>";
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
                    
                    if(axis == undefined|| distance == undefined){alert("Undefined Variable in Move command")}
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
                icon: "keyboard_arrow_left",
                href: "#"
            },
            {
                name: "Print",
                icon: "print",
                href: "#print",
                gcode: "print"
            },
            {
                name: "Print History",
                icon: "help_outline",
                href: "#print"
            },
            {
                name: "Print Settings",
                icon: "settings",
                href: "#print"
            },
        ]
        
    });
    
    //Control Page
    printerface.controller('controlController', function($scope) {
        $scope.title = 'Control';
        
            $scope.icons = [
            {
                name: "Home X",
                icon: "folder",
                href: "#control",
                gcode: "G28 X0",
            },
            {
                name: "Home Y",
                // icon: "keyboard_arrow_left",
                href: "#control",
                gcode: "G28 Y0",
            },
            {
                name: "Home Z",
                icon: "printer",
                href: "#control",
                gcode: "G28 Z0"
            },
            {
                name: "Home All",
                icon: "printer",
                href: "#control",
                gcode: "G28"
            },
            {
                name: "Back",
                icon: "keyboard_arrow_left",
                href: "#"
            },
            {
                name: "X + 10",
                icon: "printer",
                href: "#control",
                gcode: "move",
                axis: "X",
                distance: "10"
            },
            {
                name: "Y + 10",
                icon: "printer",
                href: "#control",
                gcode: "G28"
            },
            {
                name: "Z + 10",
                icon: "printer",
                href: "#control",
                gcode: "G28"
            },
        ]
        
    });

    //User Control
    printerface.controller('usersController', function($scope, $location, userPerm) {
        $scope.title = 'Users';
    
        $scope.users = [
            {
                name: "Admin",
                icon: "user",
                password: "password",
                isAdmin: true
            },
            {
                name: "Guest",
                icon: "user-outline",
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
            }
        }
    });