/** @OnlyCurrentDoc */

var spreadsheet = SpreadsheetApp.getActiveSpreadsheet().getSheets()[0];

/**
 * Group column and rows that doesn't match filters
 */
function groupNonPriorityLanguages() {
  var rowIndex = 0;
  var keepHeaders = ["Filename", "StringID", "Description", "Placeholders", "en_US", "ar", "cs"];
  var headers = spreadsheet.getDataRange().getValues()[rowIndex];
  group(keepHeaders, headers, rowIndex);

  var columnIndex = 1;
  var keepStrings = ["StringID", "options_page_title", "options_tab_help"];
  var stringList = spreadsheet.getDataRange().getValues().map(function(value)
  {
    return value[columnIndex];
  });
  group(keepStrings, stringList, columnIndex, true);
};

/**
 * @param {Array} filters array of column or row filters
 * @param {Array} items array of column or row
 * @param {Number} selectingIndex Column or row index
 * @param {Boolen} isColumn
 */
function group(filters, items, selectingIndex, isColumn)
{
  var groupStart = null;
  for (var i = 0; i < items.length; i++)
  {
    var cell = items[i];
    if (filters.indexOf(cell) != -1)
    {
      if (groupStart != null)
      {
        // getRange(row, column, numRows, numColumns)
        createGroup(groupStart, i - groupStart, selectingIndex, isColumn);
        groupStart = null;
      }
    }
    else
    {
      if (groupStart == null)
        groupStart = i;
    } 
  }
  createGroup(groupStart, items.length - groupStart, selectingIndex, isColumn);
}

/**
 * @param {Number} groupStart Grouping Start index
 * @param {Number} groupAmount Amount of grouping items after start
 * @param {Number} selectingIndex Column or row index
 * @param {Boolean} isColumn 
 */
function createGroup(groupStart, groupAmount, selectingIndex, isColumn)
{
  if (groupStart, selectingIndex, isColumn)
  {
    var selectRange = spreadsheet.getRange(groupStart + 1, selectingIndex +1, groupAmount, 1);
    selectRange.activate().shiftRowGroupDepth(1);
  }
  else
  {
    var selectRange = spreadsheet.getRange(selectingIndex +1 , groupStart + 1, 1, groupAmount);
    selectRange.activate().shiftColumnGroupDepth(1);
  }
}

function collapseAll()
{
  spreadsheet.collapseAllRowGroups();
  spreadsheet.collapseAllColumnGroups();
}
