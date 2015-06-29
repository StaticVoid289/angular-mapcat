'use strict';

/* Controllers */

var directedMap = angular.module('directedMap', []);

directedMap.controller('directedMapCtrl', function ($scope, $http) {

    // Load the test map data from maps.json
    $http.get('maps/maps.json').success(function (data) {
        $scope.nodes = data;

        // Sort the map by start point then end point. This will increase performance when searching for points
        // Quick Sort
        quickSort($scope.nodes, 0, $scope.nodes.length - 1);

        // The answer object. This object will be used to store and display the answers to the page
        $scope.answer = {
            'answerNumber' : 0,
            'answerString' : "",
            'paths' : [{
                'pathString' : "",
                'pathLength' : 0
            }]
        };

        // The question and correct given answer based on the test data
        $scope.question = "";
        $scope.correctAnswer = "";

    });

    // The onClick function for all of the question buttons. Decides which question is being asked and calculates the
    // answer to display to the page
    $scope.calculate = function(questionNumber) {

        var answer = {
            'answerNumber' : 0,
            'answerString' : "",
            'paths' : []
        };

        var currentPath = {
            'pathString' : "",
            'pathLength' : 0
        };

        switch (questionNumber) {
            case 1:
                $scope.question = '1: The distance of the route A-B-C.';
                $scope.correctAnswer = 9;

                // Distance A-B
                getDistanceAnswer("A", "B", answer);

                // Distance B-C
                getDistanceAnswer("B", "C", answer);

                break;
            case 2:
                $scope.question = '2: The distance of the route A-D.';
                $scope.correctAnswer = 5;

                // Distance A-D
                getDistanceAnswer("A", "D", answer);

                break;
            case 3:
                $scope.question = '3: The distance of the route A-D-C';
                $scope.correctAnswer = 13;

                // Distance A-D
                getDistanceAnswer("A", "D", answer);

                // Distance D-C
                getDistanceAnswer("D", "C", answer);

                break;
            case 4:
                $scope.question = '4: The distance of the route A-E-B-C-D';
                $scope.correctAnswer = 22;

                // Distance A-E
                getDistanceAnswer("A", "E", answer);

                // Distance E-B
                getDistanceAnswer("E", "B", answer);

                // Distance B-C
                getDistanceAnswer("B", "C", answer);

                // Distance C-D
                getDistanceAnswer("C", "D", answer);

                break;
            case 5:
                $scope.question = '5: The distance of the route A-E-D';
                $scope.correctAnswer = 'N/A';

                // Distance A-E
                getDistanceAnswer("A", "E", answer);

                // Distance E-D
                getDistanceAnswer("E", "D", answer);

                break;
            case 6:

                $scope.question = '6: The number of trips starting at C and ending at C with a maximum of 3 stops';
                $scope.correctAnswer = '2 (CEBC, CDC)';

                // Depth-first search starting at C, looking to come back to C within 3 recursions
                depthFirstSearch("C", "C", 0, 3, false, 0, 0, answer, currentPath);

                // Format the answers for the display page
                answer.answerNumber = answer.paths.length;

                for (var x in answer.paths) {

                    answer.answerString = answer.answerString + answer.paths[x].pathString + ", ";

                }

                // Trim off the extra comma
                answer.answerString = answer.answerString.substring(0, answer.answerString.length - 2);

                break;
            case 7:

                $scope.question = '7: The number of trips starting at A and ending at C with exactly 4 stops';
                $scope.correctAnswer = '3 (ABCDC, ADCDC, ADEBC)';

                // Depth-first search starting at A, looking to come back to C in exactly 4 recursions
                depthFirstSearch("A", "C", 4, 4, false, 0, 0, answer, currentPath);

                // Format the answers for the display page
                answer.answerNumber = answer.paths.length;

                for (var x in answer.paths) {

                    answer.answerString = answer.answerString + answer.paths[x].pathString + ", ";

                }

                // Trim off the extra comma
                answer.answerString = answer.answerString.substring(0, answer.answerString.length - 2);

                break;
            case 8:

                $scope.question = "8: The length of the shortest route (in terms of distance to travel) from A to C";
                $scope.correctAnswer = 9;

                getShortestRoute("A", "C", answer);

                break;
            case 9:

                $scope.question = "9: The length of the shortest route (in terms of distance to travel) from B to B";
                $scope.correctAnswer = 9;

                getShortestRoute("B", "B", answer);

                break;
            case 10:

                $scope.question = "10: The number of different routes from C to C with a distance of less than 30";
                $scope.correctAnswer = "7 (CDC, CEBC, CEBCDC, CDCEBC, CDEBC, CEBCEBC, CEBCEBCEBC)";

                depthFirstSearch("C", "C", 0, 0, false, 30, 0, answer, currentPath);

                // Format the answers for the display page
                answer.answerNumber = answer.paths.length;

                for (var path in answer.paths) {

                    answer.answerString = answer.answerString + answer.paths[path].pathString + ", ";

                }

                // Trim off the extra comma
                answer.answerString = answer.answerString.substring(0, answer.answerString.length - 2);

                break;
            default :

        }

        $scope.answer = answer;
    };

    // Wrapper method for depthFirstSearch. This plugs in the necessary variables for depthFirstSearch to search for
    // the shortest route between startPoint and endPoint
    function getShortestRoute(startPoint, endPoint, answerObject) {

        var currentPath = {
            'pathString' : "",
            'pathLength' : 0
        };

        depthFirstSearch(startPoint, endPoint, 0, 0, true, 0, 0, answerObject, currentPath);

        if (answerObject.paths.length > 0) {

            var min = answerObject.paths[0].pathLength,
                minIndex = 0;

            for (var x in answerObject.paths) {

                if (answerObject.paths[x].pathLength < min) {

                    min = answerObject.paths[x].pathLength;
                    minIndex = x;

                }

            }

            answerObject.answerNumber = min;
            answerObject.answerString = answerObject.paths[minIndex].pathString;

        } else {

            answerObject.answerNumber = -1;
            answerObject.answertString = "NO SUCH ROUTE";

        }


    }

    /*
    Summary: This recursive function will utilize Depth-first search to find all paths from currentStop to destination
    Parameters:
        currentStop: string containing the name of the current stop
        destination: string containing the name of the destination stop
        minIterations: number of minimum stops dictated by the constraints. Provide 0 if no minimum requirements
        maxIterations: number of maximum stops dictated by the constraints. Provide 0 if no maximum requirements
        findMinDistance: boolean representing whether or not to search for the single, minimum distance path
        maxDistance: maximum distance allowed by the problem. Provide 0 if no maximum requirements.
        currentIteration: number of current stops passed. Used for stopping the search should we pass the constraint.
        correctPaths: object containing the number of viable paths fitting the constraints so far and the string representations of the paths
        currentPath: object containing the names of the stops passed so far and the length traveled
    */
    function depthFirstSearch(currentStop, destination, minIterations, maxIterations, findMinDistance, maxDistance, currentIterations, correctPaths, currentPath) {

        // We must obey the constraints of the problem. This also helps improve performance by not bothering with trips that are too long
        if ((currentIterations < maxIterations || maxIterations == 0) && (currentPath.pathLength < maxDistance || maxDistance == 0)) {

            for (var x in $scope.nodes) {

                // We're only interested in edges that start with our start point
                if ($scope.nodes[x].startPoint == currentStop) {

                    // Record where we are and how long it took to get here
                    currentPath.pathString = currentPath.pathString + $scope.nodes[x].startPoint;
                    currentPath.pathLength = currentPath.pathLength + $scope.nodes[x].length;


                    // Does this road go where we're trying to go AND meet our constraints?
                    // Since we're looking ahead by 1 stop, we'll use currentIterations + 1
                    if ($scope.nodes[x].endPoint == destination
                        && currentIterations + 1 >= minIterations
                        && (currentPath.pathLength < maxDistance || maxDistance == 0)
                        ) {

                        // Complete the correct path
                        currentPath.pathString = currentPath.pathString + $scope.nodes[x].endPoint;
                        // Length has already been added

                        // Record that we found a correct path
                        // If we're trying to find the min distance and there is already a working path found...
                        if (findMinDistance == true && correctPaths.paths.length > 0) {

                            // If our current path is better than our previous path...
                            if (currentPath.pathLength < correctPaths.paths[0].pathLength) {

                                // Replace the winning path
                                correctPaths.paths[0] = {
                                    'pathString' : currentPath.pathString,
                                    'pathLength' : currentPath.pathLength
                                }

                            }

                        } else {

                            // Otherwise, add the current path to the list of correct paths
                            correctPaths.paths[correctPaths.paths.length] = {
                                'pathString' : currentPath.pathString,
                                'pathLength' : currentPath.pathLength
                            };

                        }

                        // Take the endPoint back off
                        currentPath.pathString = currentPath.pathString.substring(0, currentPath.pathString.length - 1);

                    }

                    // We must go deeper only if we're not looking for the min distance
                    // OR we are looking for the min distance and we haven't busted it yet
                    var currentMinDistance = 0;

                    // We need to grab the current winning distance. Since we can't count on correctPaths to have any values
                    // at this point, we'll grab the min from correctPaths if it has one, otherwise we'll fill it with the
                    // current path length
                    if (correctPaths.paths.length > 0) {

                        currentMinDistance = correctPaths.paths[0].pathLength;

                    } else {

                        currentMinDistance = currentPath.pathLength;

                    }

                    if (findMinDistance == false || (findMinDistance == true && currentPath.pathLength <= currentMinDistance)) {

                        depthFirstSearch($scope.nodes[x].endPoint,
                            destination,
                            minIterations,
                            maxIterations,
                            findMinDistance,
                            maxDistance,
                            currentIterations + 1,
                            correctPaths,
                            currentPath
                        );

                    }

                    // Veni, vidi, vici. We're heading back up.
                    currentPath.pathString = currentPath.pathString.substring(0, currentPath.pathString.length - 1);
                    currentPath.pathLength = currentPath.pathLength - $scope.nodes[x].length;

                }

            }

        }

    }

    // Use this function as a wrapper to getDistance to help format the answer (passed in by reference as currentAnswer)
    function getDistanceAnswer(startPoint, endPoint, currentAnswer) {

        // Since we return -1 when the path breaks, check to see if the path remains unbroken first
        if (currentAnswer.answerNumber >= 0) {

            var distance = getDistance(startPoint, endPoint);

            if (distance > 0) {
                currentAnswer.answerNumber = currentAnswer.answerNumber + distance;
            } else {

                // Return -1 since the path is broken
                currentAnswer.answerString = "NO SUCH ROUTE";
                currentAnswer.answerNumber = -1;

            }

        }

    }


    /*
     Summary: This function calculates the distance between the two provided points.
     Parameters:
        startPoint: The string representation of the name of the starting point
        endPoint: The string representation of the name of the ending point
     Returns: The length between the two points if a path exists. Otherwise, -1.
     */
    function getDistance(startPoint, endPoint) {

        for (var x in $scope.nodes) {

            if ($scope.nodes[x].startPoint == startPoint && $scope.nodes[x].endPoint == endPoint) {

                return $scope.nodes[x].length;

            }

        }

        return - 1;

    }


    /*
     Summary: This function utilizes the Quick sort algorithm to sort the collection passed through the "items" parameter.
     Parameters:
        items: The collection to be sorted. Passed by reference.
        left: The left index.
        right: The right index.
     */
    function quickSort(items, left, right) {

        var index;

        if (items.length > 1) {

            index = partition(items, left, right);

            if (left < index - 1) {
                quickSort(items, left, index -1);
            }

            if (index < right) {
                quickSort(items, index, right);
            }

        }

    }

    /*
     Summary: Internal function for quickSort. Finds the ideal location to partition a collection into two parts then
        checks to see that all items to the left of the partition are less than the partition and all numbers to the
        right are greater than the partition. This is the bread and butter of quick sort.
     Parameters:
        items: the collection of items being sorted
        left: the current left index
        right: the current right index
     Returns: the index of the ideal partition location relative to the items collection
     */
    function partition(items, left, right) {

        var pivot   = items[Math.floor((right + left) / 2)],
            i       = left,
            j       = right;


        while (i <= j) {

            while (items[i].startPoint < pivot.startPoint) {
                i++;
            }

            while (items[j].startPoint > pivot.startPoint) {
                j--;
            }

            if (i <= j) {
                swap(items, i, j);
                i++;
                j--;
            }

        }

        return i;
    }

    /*
     Summary: Internal method for quickSort. Swaps two items in the "items" collection as indicated by the two indices
        provided.
     Parameters:
        items: The collection being sorted
        firstIndex: The index of the first item - relative to the "items" collection - to be swapped.
        secondIndex: The index of the second item - relative to the "items" collection - to be swapped.
     */
    function swap(items, firstIndex, secondIndex) {

        var temp = items[firstIndex];
        items[firstIndex] = items[secondIndex];
        items[secondIndex] = temp;

    }

});
