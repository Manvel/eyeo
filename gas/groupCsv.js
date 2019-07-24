/** @OnlyCurrentDoc */

var spreadsheet = SpreadsheetApp.getActiveSpreadsheet().getSheets()[0];
var lastColumn = SpreadsheetApp.getActiveSheet().getLastColumn();
var lastRow = SpreadsheetApp.getActiveSheet().getLastRow();

function applySensibleDefaults()
{
  wrapWholeSheet();
  protectNonTranslationRelatedRow();
  highlighAddModify();
  freezeHeaderAndStyle();
  groupNonPriorityLanguages();
  collapseAllColumnGroups();
}

function onOpen() {
  var ui = SpreadsheetApp.getUi();
  ui.createMenu("CSV-exporter").addItem("Apply all styles", "applySensibleDefaults").addToUi();      
}

/******************************************************************************
 *                  Rows Highlighting
 ******************************************************************************/

function highlighAddModify()
{
  highlightRowByColumnText_(1, "Added", "#bbd1a8");
  highlightRowByColumnText_(1, "Modified", "#ffde97");
}

function highlightRowByColumnText_(columnNumber, text, color)
{
  var stringList = spreadsheet.getDataRange().getValues().map(function(value)
  {
    return value[columnNumber - 1];
  });
  for (var i = 0; i < stringList.length; i++)
  {
    if (stringList[i] == text)
    {
      var selectRange = spreadsheet.getRange(i + 1, columnNumber, 1, lastColumn);
      selectRange.setBackground(color);
    }
  }
}

/******************************************************************************
 *                  Range Protection
 ******************************************************************************/

function protectNonTranslationRelatedRow()
{
  protectRows_(1, 1);
  protectColumns_(1, 5);
}

function removeAllProtections()
{
  // Remove all range protections in the spreadsheet that the user has permission to edit.
  var ss = SpreadsheetApp.getActive();
  var protections = ss.getProtections(SpreadsheetApp.ProtectionType.RANGE);
  for (var i = 0; i < protections.length; i++) {
    var protection = protections[i];
    if (protection.canEdit()) {
      protection.remove();
    }
  }
}

function protectRange_(range)
{
  var protection = range.protect().setDescription('Protected by eyeo');

  protection.addEditor(Session.getEffectiveUser());
  protection.removeEditors(protection.getEditors());
  if (protection.canDomainEdit()) {
    protection.setDomainEdit(false);
  }
}

function protectRows_(startingFrom, howManyRows)
{
  var range = spreadsheet.getRange(startingFrom, 1, howManyRows, lastColumn);
  protectRange_(range);
}

function protectColumns_(startingFrom, howManyColumns)
{
  var range = spreadsheet.getRange(1, startingFrom, lastRow, howManyColumns);
  protectRange_(range);
}

/******************************************************************************
 *                  General Styling
 ******************************************************************************/

function freezeHeaderAndStyle()
{
  var range = spreadsheet.getRange(1, 1, 1, lastColumn);
  spreadsheet.setFrozenRows(1);
  range.setHorizontalAlignment("center");
  range.setFontWeight("bold");
}

function wrapWholeSheet()
{
  var range = spreadsheet.getRange(1, 1, lastRow, lastColumn);
  range.setWrap(true);
}

/******************************************************************************
 *                  Column and Row Grouping
 ******************************************************************************/

/**
 * Group column and rows that doesn't match filters
 */
function groupNonPriorityLanguages() {
  var rowIndex = 0;
  var keepHeaders = ["Type", "Filename", "StringID", "Description", "Placeholders", "en_US", "de", "fr", "es", "it", "pt_BR", "ru", "tr", "zh_CN", "nl", "hu", "pl", "el", "ko", "ar", "ja"];
  var headers = spreadsheet.getDataRange().getValues()[rowIndex];
  group_(keepHeaders, headers, rowIndex);

  var columnIndex = 2;
  var keepStrings = [];
  var stringList = spreadsheet.getDataRange().getValues().map(function(value)
  {
    return value[columnIndex];
  });
  if (keepStrings.length)
    group_(keepStrings, stringList, columnIndex, true);
};

/**
 * @param {Array} filters array of column or row filters
 * @param {Array} items array of column or row
 * @param {Number} selectingIndex Column or row index
 * @param {Boolen} isColumn
 */
function group_(filters, items, selectingIndex, isColumn)
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
        createGroup_(groupStart, i - groupStart, selectingIndex, isColumn);
        groupStart = null;
      }
    }
    else
    {
      if (groupStart == null)
        groupStart = i;
    } 
  }
  createGroup_(groupStart, items.length - groupStart, selectingIndex, isColumn);
}

/**
 * @param {Number} groupStart Grouping Start index
 * @param {Number} groupAmount Amount of grouping items after start
 * @param {Number} selectingIndex Column or row index
 * @param {Boolean} isColumn 
 */
function createGroup_(groupStart, groupAmount, selectingIndex, isColumn)
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

function collapseAllRowGroups()
{
  spreadsheet.collapseAllRowGroups();
}

function collapseAllColumnGroups()
{
  spreadsheet.collapseAllColumnGroups();
}
