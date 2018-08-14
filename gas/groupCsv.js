/** @OnlyCurrentDoc */

var spreadsheet = SpreadsheetApp.getActiveSpreadsheet().getSheets()[0];

/**
 * Group column and rows that doesn't match filters
 */
function groupNonPriorityLanguages() {
  var rowIndex = 0;
  var keepHeaders = ["Type", "Filename", "StringID", "Description", "Placeholders", "en_US", "es", "fr", "de", "pt_BR", "zh_CN", "pl", "ru", "it", "tr"];
  var headers = spreadsheet.getDataRange().getValues()[rowIndex];
  group(keepHeaders, headers, rowIndex);

  var columnIndex = 2;
  var keepStrings = [];
  var stringList = spreadsheet.getDataRange().getValues().map(function(value)
  {
    return value[columnIndex];
  });
  if (keepStrings.length)
    group(keepStrings, stringList, columnIndex, true);
};

function highlighAddModify()
{
  var lastColumn = SpreadsheetApp.getActiveSheet().getLastColumn();
  var columnIndex = 0;
  var stringList = spreadsheet.getDataRange().getValues().map(function(value)
  {
    return value[columnIndex];
  });
  for (var i = 0; i < stringList.length; i++)
  {
    var color = "";
    if (stringList[i] == "Modified")
    {
      color = "#ffde97";
    }
    else if (stringList[i] == "Added")
    {
      color = "#bbd1a8";
    }
    if (!color)
      continue

    var selectRange = spreadsheet.getRange(i + 1, columnIndex + 1, 1, lastColumn);
    selectRange.setBackground(color);
  }
}

// TODO: Fix me
function protectStringId()
{
  var columnIndex = 2;
  var lastRow = SpreadsheetApp.getActiveSheet().getLastRow();
  //var stringIdRange = spreadsheet.getRange(1, columnIndex + 1, lastRow, 1);
  var stringIdRange = SpreadsheetApp.getActive().getRange('A1:B10');
  var myValues = stringIdRange.getValues();
  var protection = stringIdRange.protect();
  protection.setDescription("Protect StringIds from being edited");
  var editors = protection.getEditors();
  protection.removeEditor(protection.getEditors());
  protection.setDomainEdit(false);
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

function collapseAllRowGroups()
{
  spreadsheet.collapseAllRowGroups();
}

function collapseAllColumnGroups()
{
  spreadsheet.collapseAllColumnGroups();
}
