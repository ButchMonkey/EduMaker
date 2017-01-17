/* global Printer */

// Create the module and name it printerface
// also include ngRoute for all our routing needs

var printerface = angular.module('printerface', ['ngRoute']);

printerface.run(function ($templateCache, $http) {
   $http.get('pages/largeButton.html', {cache: $templateCache});
   $http.get('pages/users.html', {cache: $templateCache});
   $http.get('pages/settings.html', {cache: $templateCache});
});

//Configure Routes
printerface.config(function ($routeProvider) {
   $routeProvider
      //Homepage
      .when('/', {
         templateUrl: 'pages/largeButton.html',
         controller: 'homeController'
      })
      //Print
      .when('/print', {
         templateUrl: 'pages/largeButton.html',
         controller: 'printController'
      })
      //Control
      .when('/control', {
         templateUrl: 'pages/normal.html',
         controller: 'controlController'
      })
      //Settings
      .when('/settings', {
         templateUrl: 'pages/settings.html',
         controller: 'settingsController'
      })
      //User
      .when('/users', {
         templateUrl: 'pages/users.html',
         controller: 'usersController'
      });
});

//Admin user control
printerface.factory('userPerm', function () {
   return {
      admin: false
   };
});

//Progress bar control
printerface.factory('progress', function () {
   return {
      preheat: "30%",
      print: "60%"
   };
});

//Home Page
printerface.controller('homeController', function ($scope, progress) {
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
         href: "#settings"
      },
   ];
   $scope.logout = function () {
      userPerm.admin = false;
   };

   function setStatus() {
      // if(!Printer.connnected){
      if (true) {
         Printer.cmd('connect');
         Printer.check();
         //return "<button class='btn' onclick='alert(\"Connecting\");Printer.connect();'>Connect</button>";
      } else {
         //Printer.cmd('disconnect')
         //return "<button class='btn' onclick='alert(\"Disconnecting\")'>Disconnect</button>";
      }
   }

   //This doesnt need to be here?
   // can we make this a service?
   $scope.gcode = function (gcode, axis, distance) {
      switch (gcode) {
         case "print":
            console.log('Print');
            Printer.print();
            break;
         case "cancel":
            console.log('Cancel');
            break;
         case "move":
            console.log('Move');

            if (axis == undefined || distance == undefined) {
               alert("Undefined Variable in Move command")
            }
            var feed = '';
            Printer.cmd('G91');
            if (axis == 'Z') {
               feed = '300';
            } else {
               feed = '3000';
            }
            window.setTimeout(function () {
               Printer.cmd('G1 ' + axis + distance + ' F' + feed)
            }, 50);
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
            if (gcode) {
               Printer.cmd(gcode);
            }
            break;

      }

   }

   angular.element(document).ready(function () {

      $('#console').off('change')

      $('#console').bind('input propertychange', function () {
         document.getElementById('settingsConsole').value = document.getElementById('console').value
      })

      $('#connectionButtons').html(setStatus());

      Printer.attach();
      Printer.connect();





   })

});

//Main Print Page
printerface.controller('printController', function ($scope) {
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

//Settings Page
printerface.controller('settingsController', function ($scope) {
   $scope.title = 'Settings';

   $scope.icons = [
      {
         name: "Home X",
         icon: "folder",
         href: "#settings",
         gcode: "G28 X0",
      },
      {
         name: "Back",
         icon: "keyboard_arrow_left",
         href: "#"
      },
      {
         name: "Console",
         href: "#settings"
      },
      {
         name: "Home All",
         icon: "printer",
         href: "#settings",
         gcode: "G28"
      },
      {
         name: "X + 10",
         icon: "printer",
         href: "#settings",
         gcode: "move",
         axis: "X",
         distance: "10"
      },
      {
         name: "Y + 10",
         icon: "printer",
         href: "#settings",
         gcode: "G28"
      },
      {
         name: "Z + 10",
         icon: "printer",
         href: "#settings",
         gcode: "G28"
      },
   ]

});

//Control Page
printerface.controller('controlController', function ($scope) {
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
printerface.controller('usersController', function ($scope, $location, userPerm) {
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
   $scope.login = function (user) {
      if (user.password) {
         var enteredPass = prompt("Please enter your password")
         if (enteredPass == user.password) {
            if (user.isAdmin) {
               userPerm.admin = true;
            }
            $location.url("/")
         }
      }
   }
});