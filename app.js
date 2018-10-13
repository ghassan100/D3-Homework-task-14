var svgWidth = 900;
var svgHeight = 500;

var margin = { top: 30, right: 40, bottom: 150, left: 150 };

var width = svgWidth - margin.left - margin.right;
var height = svgHeight - margin.top - margin.bottom;

// Create an SVG wrapper, append an SVG group that will hold our chart, and shift the latter by left and top margins.
var svg = d3
  .select(".chart")
  .append("svg")
  .attr("width", svgWidth)
  .attr("height", svgHeight)
  .append("g")
  .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

// Append an SVG group
var chart = svg.append("g");

// Append a div to the body to create tooltips, assign it a class
d3.select(".chart").append("div").attr("class", "tooltip").style("opacity", 0);

// Retrieve data from the CSV file and execute everything below
d3.csv("data.csv", function(err, myData) {
  if (err) throw err;

  myData.forEach(function(data) {
    data.poverty = Number(data.poverty);
    data.age = Number(data.age);
    data.income = Number(data.income);
    data.healthcareLow = Number(data.healthcareLow);
    data.smokes = Number(data.smokes);
    data.obesity = Number(data.obesity);
  });

  console.log(myData);

  // Create scale functions
  var yLinearScale = d3.scaleLinear().range([height, 0]);

  var xLinearScale = d3.scaleLinear().range([0, width]);

  // Create axis functions
  var bottomAxis = d3.axisBottom(xLinearScale);
  var leftAxis = d3.axisLeft(yLinearScale);

  // Variables store minimum and maximum values in a column in data.csv
  var xMin;
  var xMax;
  var yMax;

  // Function identifies the minimum and maximum values in a column in data.csv
  // and assigns them to xMin and xMax variables, which defines the axis domain
  function findMinAndMax(dataColumnX) {
    xMin = d3.min(myData, function(data) {
      return Number(data[dataColumnX]) * 0.8;
    });

    xMax = d3.max(myData, function(data) {
      return Number(data[dataColumnX]) * 1.1;
    });

    yMax = d3.max(myData, function(data) {
      return Number(data.obesity) * 1.1;
    });
  }

 function findMinAndMaxY(dataColumnY) {
    yMin = d3.min(myData, function(data) {
      return Number(data[dataColumnY]) * 0.8;
    });

    yMax = d3.max(myData, function(data) {
      return Number(data[dataColumnY]) * 1.1;
    });

    xMax = d3.max(myData, function(data) {
      return Number(data.poverty) * 1.1;
    });
  }



  // The default x-axis is 'poverty'
  // Another axis can be assigned to the variable during an onclick event.
  var currentAxisLabelX = "poverty";

  var currentAxisLabelY = "obesity";

  // Call findMinAndMax() with default
  findMinAndMax(currentAxisLabelX);

  // Set domain of an axis to extend from min to max values of the data column
  xLinearScale.domain([xMin, xMax]);
  yLinearScale.domain([0, yMax]);

  // Initializes tooltip
  var toolTip = d3
    .tip()
    .attr("class", "tooltip")
    // Define position
    .offset([80, -60])
    .html(function(data) {
      var itemName = data.state;
      var itemE = Number(data.obesity);
      var itemInfo = Number(data[currentAxisLabelX]);
      var itemString;
      // Tooltip text depends on which axis is active
      if (currentAxisLabelX === "poverty") {
        itemString = "Poverty: ";
      }
      else {
        itemString = "Age (Median): ";
      }
      if (currentAxisLabelY === "obesity") {
        eString = "Obese: ";
      }
      else {
        eString = "Smokers (%): ";
      }
      return itemName +
        "<hr>" +
        eString +
        itemE + "%<br>" +
        itemString +
        itemInfo + "%";
    });

  // Create tooltip
  chart.call(toolTip);

  chart
    .selectAll("circle")
    .data(myData)
    .enter()
    .append("circle")
    .attr("cx", function(data, index) {
      return xLinearScale(Number(data[currentAxisLabelX]));
    })
    .attr("cy", function(data, index) {
      return yLinearScale(Number(data.healthcareLow));
    })
    .attr("r", "12")
    .attr("fill", "lightblue")
    // Both circle and text instances have mouseover & mouseout event handlers
    .on("mouseover", function(data) {
      toolTip.show(data)})
    .on("mouseout", function(data) {
      toolTip.hide(data)});

  chart
    .selectAll("text")
    .data(myData)
    .enter()
    .append("text")
    .attr("text-anchor", "middle")
    .attr("class","stateText")
    .style("fill", "white")
    .style("font", "10px sans-serif")
    .style("font-weight", "bold")
    .text(function(data) {
      return data.abbr;})
    .on("mouseover", function(data) {
      toolTip.show(data)})
    .on("mouseout", function(data) {
      toolTip.hide(data)})
    .attr("x", function(data, index) {
      return xLinearScale(Number(data[currentAxisLabelX]));
    })
    .attr("y", function(data, index) {
      return yLinearScale(Number(data.healthcareLow))+4;
    });

// Append an SVG group for the x-axis, then display the x-axis
  chart
    .append("g")
    .attr("transform", "translate(0," + height + ")")
    // The class name assigned here will be used for transition effects
    .attr("class", "x-axis")
    .call(bottomAxis);

  // Append a group for y-axis, then display it
  chart.append("g")
    .attr("class", "y-axis")
    .call(leftAxis);

  // Append y-axis labels
  chart
    .append("text")
    .attr("transform", "rotate(-90)")
    .attr("y", 0 - margin.left + 25)
    .attr("x", 0 - height / 2)
    .attr("dy", "1em")
    .attr("class", "axis inactive")
    .attr("data-axis-name", "obesity")
    .text("Obese(%)");

  chart
    .append("text")
    .attr("transform", "rotate(-90)")
    .attr("y", 0 - margin.left + 65)
    .attr("x", 0 - height / 2)
    .attr("dy", "1em")
    .attr("class", "axis inactive")
    .attr("data-axis-name", "healthcareLow")
    .text("Lacks Healthcare (%)");

  chart
    .append("text")
    .attr("transform", "rotate(-90)")
    .attr("y", 0 - margin.left + 45)
    .attr("x", 0 - height / 2)
    .attr("dy", "1em")
    .attr("class", "axis inactive")
    .attr("data-axis-name", "smokes")
    .text("Smokers (%)");


  // Append x-axis labels
  chart
    .append("text")
    .attr(
      "transform",
      "translate(" + width / 2 + " ," + (height + margin.top + 20) + ")"
    )
    // This axis label is active by default
    .attr("class", "axis-text inactive")
    .attr("data-axis-name", "poverty")
    .text("In Poverty (%)");

  chart
    .append("text")
    .attr(
      "transform",
      "translate(" + width / 2 + " ," + (height + margin.top + 45) + ")"
    )
    .attr("class", "axis-text inactive")
    .attr("data-axis-name", "age")
    .text("Age (Median)");

  chart
    .append("text")
    .attr(
      "transform",
      "translate(" + width / 2 + " ," + (height + margin.top + 65) + ")"
    )
    .attr("class", "axis-text inactive")
    .attr("data-axis-name", "income")
    .text("Households income (Median)");

  // Change an axis's status from inactive to active when clicked (if it was inactive)
  // Change the status of all active axes to inactive otherwise
  function labelChange(clickedAxis) {
    d3
      .selectAll(".axis-text")
      .filter(".active")
      .classed("active", false)
      .classed("inactive", true);

    clickedAxis.classed("inactive", false).classed("active", true);
  }
  d3.selectAll(".axis-text").on("click", function() {
    // Assign a variable to current axis
    var clickedSelection = d3.select(this);
    // "true" or "false" based on whether the axis is currently selected
    var isClickedSelectionInactive = clickedSelection.classed("inactive");
    // Grab the data-attribute of the axis and assign it to a variable
    // e.g. if data-axis Name is "poverty," var clickedAxis = "poverty"
    var clickedAxis = clickedSelection.attr("data-axis-name");

    // The onclick events below take place only if the x-axis is inactive
    // Clicking on an already active axis will therefore do nothing
    if (isClickedSelectionInactive) {
      // Assign the clicked axis to the variable currentAxisLabelX
      currentAxisLabelX = clickedAxis;
      // Call findMinAndMax() to define the min and max domain values.
      findMinAndMax(currentAxisLabelX);
      // Set the domain for the x-axis
      xLinearScale.domain([xMin, xMax]);
      // Create a transition effect for the x-axis
      svg
        .select(".x-axis")
        .transition()
        .ease(d3.easeElastic)
        .duration(1800)
        .call(bottomAxis);

      // Select all circles to create a transition effect, then relocate its horizontal location
      // based on the new axis that was selected/clicked
      d3.selectAll("circle").each(function() {
        d3
          .select(this)
          .transition()
          .ease(d3.easeBounce)
          .attr("cx", function(data, index) {
            return xLinearScale(Number(data[currentAxisLabelX]));
          })
          .duration(1800);
      });

      d3.selectAll(".stateText").each(function() {
        d3
          .select(this)
          .transition()
          .ease(d3.easeBounce)
          .attr("x", function(data, index) {
            return xLinearScale(Number(data[currentAxisLabelX]));
          })
          .duration(1800);
      });

//Ghassan
      // Change the status of the axes. See above for more info on this function.
//        labelChange(clickedSelection);
    }

  d3.selectAll(".axis").on("click", function() {
    // Assign a variable to current axis
    var clickedSelection = d3.select(this);
    // "true" or "false" based on whether the axis is currently selected
    var isClickedSelectionInactive = clickedSelection.classed("inactive");
    // Grab the data-attribute of the axis and assign it to a variable
    // e.g. if data-axis Name is "poverty," var clickedAxis = "poverty"
    var clickedAxis = clickedSelection.attr("data-axis-name");

    // The onclick events below take place only if the x-axis is inactive
    // Clicking on an already active axis will therefore do nothing
    if (isClickedSelectionInactive) {
      // Assign the clicked axis to the variable currentAxisLabelX
      currentAxisLabelY = clickedAxis;
      // Call findMinAndMaxY() to define the min and max domain values.
      findMinAndMaxY(currentAxisLabelY);
      // Set the domain for the y-axis
      yLinearScale.domain([yMin, yMax]);
      // Create a transition effect for the y-axis
      svg
        .select(".y-axis")
        .transition()
        .ease(d3.easeElastic)
        .duration(1800)
        .call(leftAxis);

      // Select all circles to create a transition effect, then relocate its horizontal location
      // based on the new axis that was selected/clicked
      d3.selectAll("circle").each(function() {
        d3
          .select(this)
          .transition()
          .ease(d3.easeBounce)
          .attr("cy", function(data, index) {
            return yLinearScale(Number(data[currentAxisLabelY]));
          })
          .duration(1800);
      });

      d3.selectAll(".stateText").each(function() {
        d3
          .select(this)
          .transition()
          .ease(d3.easeBounce)
          .attr("y", function(data, index) {
            return yLinearScale(Number(data[currentAxisLabelY]));
          })
          .duration(1800);
      });

      // Change the status of the axes. See above for more info on this function.
//      labelChange(clickedSelection);
    }
  });
});
});

