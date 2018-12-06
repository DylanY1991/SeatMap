(function() { 'use strict';

angular.module('seatMap', []).controller('seatMapController', function($scope, $http) {
    // ref to controller object
    const self = this;
    // suppose at most 26 columns (aisle included)
    const seatBase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    // all possible cabins
    const allCabins = ['First','Business','Economy'];
    

    // ==================================================
    // Function List
    // ==================================================
    // Read data from JSON file
    this.loadData = loadDataFunc;
    // format cabins, rows & seats
    this.setupRowsAndSeats = setupRowsAndSeatsFunc;
    // get the max number of columns in each cabin, include aisles
    this.getMaxColumns= getMaxColumnsFunc;
    // insert aisles
    this.insetAisles = insetAislesFunc;
    // display seat number
    this.displaySesat = displaySesatFunc;
    // set DOM class for seat
    this.setSeatDomClass = setSeatDomClassFunc;
    // when user select a seat
    this.selectSeat = selectSeatFunc;
    

    // ==================================================
    // Initialization
    // ==================================================
    this.data = {
        total: 0,
        occupied: 0,
        availFirst: 0,
        availBusiness: 0,
        availEco: 0,
        selection: ''
    };
    this.cabins = [];
    this.maxCols = [];  

    this.loadData(function(data) {
        // format data
        allCabins.forEach(function(cabin, i) {
            self.cabins[i] = self.setupRowsAndSeats(data.filter(obj=>obj.class===cabin));
            self.maxCols[i] = self.getMaxColumns(self.cabins[i]);

            // fill aisle - this process will modify original cabin arrays
            self.insetAisles(self.cabins[i], self.maxCols[i]);
        });
        // count
        data.forEach(function(obj) {
            if (obj.occupied) {
                self.data.occupied++;
            }
            else {
                if (obj.class === allCabins[0]) {
                    self.data.availFirst++;
                } 
                else if (obj.class === allCabins[1]) {
                    self.data.availBusiness++;
                }
                else if (obj.class === allCabins[2]) {
                    self.data.availEco++;
                }
            }
            self.data.total++;
        });
    });


    // ==================================================
    // Function Definition
    // ==================================================
    function loadDataFunc(callback) {
        $http.get('data/data.json').then(function(res) {
            if (res && res.data) {
                callback(res.data || []);
            }
        });
    }
    function setupRowsAndSeatsFunc(arr) {
        var rowObj = (arr || []).reduce(function(t, obj) {
            if (typeof obj.row !== void 0) {
                if (!t[obj.row]) {
                    t[obj.row] = [];
                }
                t[obj.row].push(obj);
            }
            return t;
        }, {});
        return Object.values(rowObj);
    }
    function getMaxColumnsFunc(cabin) {
        if (Array.isArray(cabin) && Array.isArray(cabin[0])) {
            var seats = cabin[0].map(obj=>obj.seat).sort();
            var start = seatBase.search(seats[0]), 
                end = seatBase.search(seats[seats.length-1]);
            if (start > -1 && end > -1) {
                return seatBase.slice(start, end+1).split("");
            }
        }
        return [];
    }
    function insetAislesFunc(cabin, maxCols) {
        if (Array.isArray(cabin) && Array.isArray(maxCols)) {
            var aisles = [];
            // find all the seat letters (no aisles)
            var allSeats = (cabin[0] || []).reduce(function(h, seat) {
                if (!h[seat.seat]) {
                    h[seat.seat] = 1;
                }
                return h;
            }, {});
            // find where aisles come up
            (maxCols || []).forEach(function(col) {
                if (!allSeats[col]) {
                    aisles.push(col);
                }
            });
            // re-format cabin, insert aisles
            if (aisles.length) {
                (cabin || []).forEach(function(row) {
                    aisles.forEach(function(seat) {
                        if (row[0]) {
                            row.push({
                                row: row[0].row,
                                seat: seat,
                                aisle: true,
                                class: row[0].class
                            });
                        }
                    });
                });
            }
        }
    }
    function displaySesatFunc(seatObj) {
        if (seatObj) {
            if (seatObj.aisle) {
                return '';
            }
            else if (seatObj.occupied) {
                return ' X ';
            }
            else {
                return `${seatObj.row}${seatObj.seat}`;
            }
        }
        return '';
    }
    function setSeatDomClassFunc(seatObj) {
        if (seatObj.aisle) {
            return 'seat-aisle';
        }
        else if (seatObj.occupied) {
            return 'seat-occupied';
        }
        else if (seatObj.class === allCabins[0]) {
            return 'seat-avail-first';
        }
        else if (seatObj.class === allCabins[1]) {
            return 'seat-avail-business';
        }
        else if (seatObj.class === allCabins[2]) {
            return 'seat-avail-eco';
        }
        else {
            return '';
        }
    }
    function selectSeatFunc(seatObj, $event) {
        if (seatObj) {
            if (seatObj.aisle) {
                return;
            }
            else if (seatObj.occupied) {
                return showMsg({
                    type: 'warning',
                    message: `Seat ${seatObj.row}${seatObj.seat} is occupied. Please select another one.`
                });
            }
            // event happens only if the seat is available
            else {
                var $target = angular.element($event.target);

                // if already select, this click will un-select the seat
                if ($target.hasClass('seat-selected')) {
                    // remove highlighted color
                    $target.removeClass('seat-selected');
                    // update statistics
                    self.data.selection = ``;
                    self.data.selectedCabin = ``;
                }
                else {
                    // reset any other selected
                    angular.element(document.querySelector('.seat.seat-selected')).removeClass('seat-selected');

                    // highlight the selected seat
                    $target.addClass('seat-selected');

                    // update statistics
                    self.data.selection = `${seatObj.row}-${seatObj.seat}`;
                    self.data.selectedCabin = `cabin-selected-${seatObj.class}`;
                }
            }
        }
    }
});

})();