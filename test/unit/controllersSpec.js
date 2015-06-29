'use strict';

/* jasmine specs for controllers go here */
describe('MapCat controllers', function() {

  beforeEach(function(){
    this.addMatchers({
      toEqualData: function(expected) {
        return angular.equals(this.actual, expected);
      }
    });
  });

  describe('directedMapCtrl', function(){
    var scope, ctrl, $httpBackend;

    beforeEach(inject(function(_$httpBackend_, $rootScope, $controller) {
      $httpBackend = _$httpBackend_;
      $httpBackend.expectGET('maps/maps.json').
          respond([
              {"startPoint": "A",
                  "endPoint": "B",
                  "length": 5},
              {"startPoint": "B",
                  "endPoint": "C",
                  "length": 4},
              {"startPoint": "C",
                  "endPoint": "D",
                  "length": 8},
              {"startPoint": "D",
                  "endPoint": "C",
                  "length": 8},
              {"startPoint": "D",
                  "endPoint": "E",
                  "length": 6},
              {"startPoint": "A",
                  "endPoint": "D",
                  "length": 5},
              {"startPoint": "C",
                  "endPoint": "E",
                  "length": 2},
              {"startPoint": "E",
                  "endPoint": "B",
                  "length": 3},
              {"startPoint": "A",
                  "endPoint": "E",
                  "length": 7}
          ]);

      scope = $rootScope.$new();
      ctrl = $controller('directedMapCtrl', {$scope: scope});
    }));


    it('should create "nodes" model with 9 nodes fetched from xhr', function() {
      expect(scope.nodes).toEqualData([]);
      $httpBackend.flush();

      expect(scope.nodes).toEqualData(
          [
              {"startPoint": "A",
                  "endPoint": "B",
                  "length": 5},
              {"startPoint": "B",
                  "endPoint": "C",
                  "length": 4},
              {"startPoint": "C",
                  "endPoint": "D",
                  "length": 8},
              {"startPoint": "D",
                  "endPoint": "C",
                  "length": 8},
              {"startPoint": "D",
                  "endPoint": "E",
                  "length": 6},
              {"startPoint": "A",
                  "endPoint": "D",
                  "length": 5},
              {"startPoint": "C",
                  "endPoint": "E",
                  "length": 2},
              {"startPoint": "E",
                  "endPoint": "B",
                  "length": 3},
              {"startPoint": "A",
                  "endPoint": "E",
                  "length": 7}
          ]);
    });

  });

});
