"use strict";

const server = "https://public.tableau.com";
const site = "";

let oldHtml;

// Vizzes to load
const mainViz = {
  viz: null,
  workbook: null,
  activeSheet: null,
  activeFilterSheet: null,
  url: "SchoolDistrict_Top500_DiversityScore/Dashboard2",
  elemId: "tableauViz",
  vizUrl: null,
};

// Viz loading and manipulating functions
function initViz(elem) {
  console.log(`Entering initViz for ${elem.elemId}...`);
  if (site !== "") {
    elem.vizUrl = `${server}/t/${site}/views/${elem.url}`;
  } else {
    elem.vizUrl = `${server}/views/${elem.url}`;
  }
  console.log(
    `Developing viz ${elem.url} with elemId ${elem.elemId} giving a Viz URL of ${elem.vizUrl}`
  );
  let containerDiv = document.getElementById(`${elem.elemId}`),
    options = {
      hideTabs: true,
      hideToolbar: true,
      onFirstInteractive: function () {
        console.log(`First interactive for ${elem.elemId}`);
        elem.workbook = elem.viz.getWorkbook();
        elem.activeSheet = elem.workbook.getActiveSheet();
        // elem.activeFilterSheet = getFilterSheet(elem);
      },
    };
  elem.viz = new tableau.Viz(containerDiv, elem.vizUrl, options);
  return elem.viz;
}

function loadViz(elem) {
  let viz;
  window.addEventListener("load", (event) => {
    console.log("Page is fully loaded, loading embedded viz.");
    console.log(elem.viz);
    viz = initViz(elem);
    console.log(`End of InitViz ${elem.elemId}`);
  });
}

function getFilterSheet(elem) {
  let activeFilterSheet, i;
  let worksheets = [];
  switch (elem.activeSheet.getSheetType()) {
    case "worksheet":
      break;
    case "dashboard":
      console.log("Found Dashboard!");
      worksheets = elem.activeSheet.getWorksheets();
      for (i = 0; i < worksheets.length; i++) {
        console.log(worksheets[i].getName());
        activeFilterSheet = worksheets[i];
        activeFilterSheet.getFiltersAsync().then(getFilters);
        console.log(`Found the sheet I need for filter: ${activeFilterSheet}`);
        break;
      }
      break;
    case "story":
      break;
  }
  return activeFilterSheet;
}

function getFilters(filters) {
  console.log(`Entering getFilters: ${filters}`);
  console.log("filters.length:", filters.length);
  console.log(filters);
  for (let filter of filters) {
    const tmp_fieldName = filter.getFieldName();
    console.log("Filter name: ", tmp_fieldName);
    const tmp_dtype = filter.getFilterType();
    console.log("Filter Type: ", tmp_dtype);
    if (tmp_fieldName != "Measure Names") {
      switch (tmp_dtype) {
        // if filter type is categorical do this
        case "categorical":
          createFilterList(
            filter,
            filterMapper[tmp_fieldName.replace(" ", "")][1]
          );
          break;
      }
      console.log("Ending Switch");
    }
  }
}

function createFilterList(filter, dropdownId) {
  const tmpUniqueValues = [];
  const filterSelect = document.getElementById(dropdownId);
  const filterOption = new Option("(All)", "All", false, false);
  filterSelect.appendChild(filterOption);
  console.log(`Creating filter list for ${dropdownId}...`);
  for (let j = 0; j < filter.getAppliedValues().length; j++) {
    tmpUniqueValues.push({ id: j, text: filter.getAppliedValues()[j].value });
    const filterOption = document.createElement("option");
    filterOption.onclick = "console.log('Hello there!');";
    filterOption.value = filter.getAppliedValues()[j].value;
    filterOption.text = filter.getAppliedValues()[j].value;
    console.log(filter.getWorksheet());
    filterSelect.appendChild(filterOption);
  }
}

function exportToPDF(elem) {
  elem.viz.showExportPDFDialog();
}

function downloadExcel(elem) {
  elem.viz.exportCrossTabToExcel();
}

function downloadDialog(elem) {
  elem.viz.showDownloadDialog();
}

function refreshData(elem) {
  elem.viz.refreshDataAsync();
}

loadViz(mainViz);
console.log("In JS file");
