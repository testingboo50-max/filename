// =====================================================
// 📊 SHEET NAMES
// =====================================================
const DATA_SHEET = "Data";
const REVENUE_SHEET = "Revenue";
const STAFF_CALC_SHEET = "StaffCalculation";
const PRODUCT_SHEET = "Product";

// =====================================================
// 🔹 MAIN API
// =====================================================
function doGet(e) {
  const action = e.parameter.action;

  // 📘 Data APIs
  if (action === "add") return addData(e);
  if (action === "update") return updateData(e);
  if (action === "delete") return deleteData(e);
  if (action === "list") return listData();

  // 💰 Fixed Revenue (A2:C2)
  if (action === "setRevenue") return setRevenue(e);
  if (action === "updateCell") return updateCell(e);
  if (action === "getRevenue") return getRevenue();
  if (action === "totalRevenue") return getTotalRevenue();

  // 👥 Staff Calculation
  if (action === "addStaffCalculation") return addStaffCalculation(e);
  if (action === "getStaffCalculation") return getStaffCalculation(e);
  if (action === "listStaffCalculations") return listStaffCalculations();
  if (action === "updateStaffCalculation") return updateStaffCalculation(e);
  if (action === "deleteStaffCalculation") return deleteStaffCalculation(e);

  // 🛒 Product Sheet
  if (action === "addProduct") return addProduct(e);
  if (action === "getProduct") return getProduct(e);
  if (action === "listProducts") return listProducts();
  if (action === "updateProduct") return updateProduct(e);
  if (action === "deleteProduct") return deleteProduct(e);
  
  // 📊 Get All Data
  if (action === "getAllData") return getAllData();
  
  // 🧮 Calculate School Revenues
  if (action === "calculateSchoolRevenues") return calculateSchoolRevenues();

  return output({ status: "error", message: "Invalid action" });
}

// =====================================================
// 🔹 COMMON
// =====================================================
function output(data) {
  return ContentService
    .createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}

function getDataSheet() {
  return SpreadsheetApp.getActiveSpreadsheet().getSheetByName(DATA_SHEET);
}

function getRevenueSheet() {
  return SpreadsheetApp.getActiveSpreadsheet().getSheetByName(REVENUE_SHEET);
}

function getStaffCalcSheet() {
  let sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(STAFF_CALC_SHEET);
  if (!sheet) {
    sheet = SpreadsheetApp.getActiveSpreadsheet().insertSheet(STAFF_CALC_SHEET);
    sheet.getRange("A1:F1").setValues([["ID", "Name", "Amount", "Number of Months", "No of Staff", "Timestamp"]]);
  }
  return sheet;
}

function getProductSheet() {
  let sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(PRODUCT_SHEET);
  if (!sheet) {
    sheet = SpreadsheetApp.getActiveSpreadsheet().insertSheet(PRODUCT_SHEET);
    sheet.getRange("A1:E1").setValues([["ID", "Name", "Amount", "Quantity", "Timestamp"]]);
  }
  return sheet;
}

// =====================================================
// 📘 DATA SHEET (CRUD)
// =====================================================

function addData(e) {
  const sheet = getDataSheet();
  const id = new Date().getTime();
  const student = parseFloat(e.parameter.student) || 0;
  const amount = parseFloat(e.parameter.amount) || 0;
  sheet.appendRow([id, student, amount, new Date()]);
  return output({ status: "success", id });
}

function listData() {
  const sheet = getDataSheet();
  const data = sheet.getDataRange().getValues();
  const headers = data[0];
  let result = [];
  for (let i = 1; i < data.length; i++) {
    if (!data[i][0]) continue;
    let obj = {};
    for (let j = 0; j < headers.length; j++) {
      obj[headers[j]] = data[i][j];
    }
    result.push(obj);
  }
  return output({ status: "success", data: result });
}

function updateData(e) {
  const sheet = getDataSheet();
  const id = e.parameter.id;
  const data = sheet.getDataRange().getValues();
  for (let i = 1; i < data.length; i++) {
    if (data[i][0] == id) {
      if (e.parameter.student !== undefined)
        sheet.getRange(i + 1, 2).setValue(parseFloat(e.parameter.student));
      if (e.parameter.amount !== undefined)
        sheet.getRange(i + 1, 3).setValue(parseFloat(e.parameter.amount));
      return output({ status: "success", message: "Updated" });
    }
  }
  return output({ status: "error", message: "ID not found" });
}

function deleteData(e) {
  const sheet = getDataSheet();
  const id = e.parameter.id;
  const data = sheet.getDataRange().getValues();
  for (let i = 1; i < data.length; i++) {
    if (data[i][0] == id) {
      sheet.deleteRow(i + 1);
      return output({ status: "success", message: "Deleted" });
    }
  }
  return output({ status: "error", message: "ID not found" });
}

// =====================================================
// 💰 REVENUE (FIXED CELLS A2:C2)
// =====================================================

function setRevenue(e) {
  const sheet = getRevenueSheet();
  const s1 = parseFloat(e.parameter.school1) || 0;
  const s2 = parseFloat(e.parameter.school2) || 0;
  const s3 = parseFloat(e.parameter.school3) || 0;
  sheet.getRange("A2:C2").setValues([[s1, s2, s3]]);
  sheet.getRange("D2").setValue(new Date());
  
  // Calculate total revenue
  const totalRevenue = s1 + s2 + s3;
  
  return output({ 
    status: "success", 
    data: { school1: s1, school2: s2, school3: s3 },
    total_revenue: totalRevenue
  });
}

function updateCell(e) {
  const sheet = getRevenueSheet();
  const field = e.parameter.field;
  const value = parseFloat(e.parameter.value) || 0;
  let cell;
  if (field === "school1") cell = "A2";
  else if (field === "school2") cell = "B2";
  else if (field === "school3") cell = "C2";
  else return output({ status: "error", message: "Invalid field" });
  sheet.getRange(cell).setValue(value);
  
  // Get updated values and calculate total
  const row = sheet.getRange("A2:C2").getValues()[0];
  const totalRevenue = (parseFloat(row[0]) || 0) + (parseFloat(row[1]) || 0) + (parseFloat(row[2]) || 0);
  
  return output({ 
    status: "success", 
    field: field, 
    value: value,
    total_revenue: totalRevenue
  });
}

function getRevenue() {
  const sheet = getRevenueSheet();
  const row = sheet.getRange("A2:D2").getValues()[0];
  const school1 = parseFloat(row[0]) || 0;
  const school2 = parseFloat(row[1]) || 0;
  const school3 = parseFloat(row[2]) || 0;
  const totalRevenue = school1 + school2 + school3;
  
  return output({
    status: "success",
    data: { school1: school1, school2: school2, school3: school3, timestamp: row[3] },
    total_revenue: totalRevenue
  });
}

function getTotalRevenue() {
  const sheet = getRevenueSheet();
  const row = sheet.getRange("A2:C2").getValues()[0];
  const total = (parseFloat(row[0]) || 0) + (parseFloat(row[1]) || 0) + (parseFloat(row[2]) || 0);
  return output({ status: "success", total_revenue: total });
}

// =====================================================
// 👥 STAFF CALCULATION SHEET (WITH NAME FIELD)
// =====================================================

function addStaffCalculation(e) {
  const sheet = getStaffCalcSheet();
  const id = new Date().getTime();
  const name = e.parameter.name || "";
  const amount = parseFloat(e.parameter.amount) || 0;
  const numberOfMonths = parseFloat(e.parameter.numberOfMonths) || 0;
  const noOfStaff = parseFloat(e.parameter.noOfStaff) || 0;
  const total = amount * numberOfMonths * noOfStaff;
  sheet.appendRow([id, name, amount, numberOfMonths, noOfStaff, new Date()]);
  return output({ status: "success", id: id, total: total });
}

function getStaffCalculation(e) {
  const sheet = getStaffCalcSheet();
  const id = e.parameter.id;
  const data = sheet.getDataRange().getValues();
  for (let i = 1; i < data.length; i++) {
    if (data[i][0] == id) {
      const name = data[i][1] || "";
      const amount = parseFloat(data[i][2]) || 0;
      const months = parseFloat(data[i][3]) || 0;
      const staff = parseFloat(data[i][4]) || 0;
      const total = amount * months * staff;
      return output({
        status: "success",
        data: { id: data[i][0], name: name, amount: amount, numberOfMonths: months, noOfStaff: staff, timestamp: data[i][5] },
        total: total
      });
    }
  }
  return output({ status: "error", message: "ID not found" });
}

function listStaffCalculations() {
  const sheet = getStaffCalcSheet();
  const data = sheet.getDataRange().getValues();
  if (data.length <= 1) return output({ status: "success", data: [] });
  const headers = data[0];
  let result = [];
  let grandTotal = 0;
  
  for (let i = 1; i < data.length; i++) {
    if (!data[i][0]) continue;
    let obj = {};
    for (let j = 0; j < headers.length; j++) obj[headers[j]] = data[i][j];
    
    const amount = parseFloat(data[i][2]) || 0;
    const months = parseFloat(data[i][3]) || 0;
    const staff = parseFloat(data[i][4]) || 0;
    const total = amount * months * staff;
    obj.total = total;
    grandTotal += total;
    
    result.push(obj);
  }
  return output({ status: "success", data: result, grand_total: grandTotal });
}

function updateStaffCalculation(e) {
  const sheet = getStaffCalcSheet();
  const id = e.parameter.id;
  const data = sheet.getDataRange().getValues();
  for (let i = 1; i < data.length; i++) {
    if (data[i][0] == id) {
      if (e.parameter.name !== undefined) sheet.getRange(i + 1, 2).setValue(e.parameter.name);
      if (e.parameter.amount !== undefined) sheet.getRange(i + 1, 3).setValue(parseFloat(e.parameter.amount));
      if (e.parameter.numberOfMonths !== undefined) sheet.getRange(i + 1, 4).setValue(parseFloat(e.parameter.numberOfMonths));
      if (e.parameter.noOfStaff !== undefined) sheet.getRange(i + 1, 5).setValue(parseFloat(e.parameter.noOfStaff));
      sheet.getRange(i + 1, 6).setValue(new Date());
      
      // Get updated values and calculate total
      const amount = parseFloat(sheet.getRange(i + 1, 3).getValue()) || 0;
      const months = parseFloat(sheet.getRange(i + 1, 4).getValue()) || 0;
      const staff = parseFloat(sheet.getRange(i + 1, 5).getValue()) || 0;
      const total = amount * months * staff;
      
      return output({ status: "success", message: "Updated", total: total });
    }
  }
  return output({ status: "error", message: "ID not found" });
}

function deleteStaffCalculation(e) {
  const sheet = getStaffCalcSheet();
  const id = e.parameter.id;
  const data = sheet.getDataRange().getValues();
  for (let i = 1; i < data.length; i++) {
    if (data[i][0] == id) {
      sheet.deleteRow(i + 1);
      return output({ status: "success", message: "Deleted" });
    }
  }
  return output({ status: "error", message: "ID not found" });
}

// =====================================================
// 🛒 PRODUCT SHEET (WITH NAME FIELD)
// =====================================================

function addProduct(e) {
  const sheet = getProductSheet();
  const id = new Date().getTime();
  const name = e.parameter.name || "";
  const amount = parseFloat(e.parameter.amount) || 0;
  const quantity = parseFloat(e.parameter.quantity) || 0;
  const total = amount * quantity;
  sheet.appendRow([id, name, amount, quantity, new Date()]);
  return output({ status: "success", id: id, total: total });
}

function getProduct(e) {
  const sheet = getProductSheet();
  const id = e.parameter.id;
  const data = sheet.getDataRange().getValues();
  for (let i = 1; i < data.length; i++) {
    if (data[i][0] == id) {
      const name = data[i][1] || "";
      const amount = parseFloat(data[i][2]) || 0;
      const quantity = parseFloat(data[i][3]) || 0;
      const total = amount * quantity;
      return output({
        status: "success",
        data: { id: data[i][0], name: name, amount: amount, quantity: quantity, timestamp: data[i][4] },
        total: total
      });
    }
  }
  return output({ status: "error", message: "ID not found" });
}

function listProducts() {
  const sheet = getProductSheet();
  const data = sheet.getDataRange().getValues();
  if (data.length <= 1) return output({ status: "success", data: [] });
  const headers = data[0];
  let result = [];
  let grandTotal = 0;
  
  for (let i = 1; i < data.length; i++) {
    if (!data[i][0]) continue;
    let obj = {};
    for (let j = 0; j < headers.length; j++) obj[headers[j]] = data[i][j];
    
    const amount = parseFloat(data[i][2]) || 0;
    const quantity = parseFloat(data[i][3]) || 0;
    const total = amount * quantity;
    obj.total = total;
    grandTotal += total;
    
    result.push(obj);
  }
  return output({ status: "success", data: result, grand_total: grandTotal });
}

function updateProduct(e) {
  const sheet = getProductSheet();
  const id = e.parameter.id;
  const data = sheet.getDataRange().getValues();
  for (let i = 1; i < data.length; i++) {
    if (data[i][0] == id) {
      if (e.parameter.name !== undefined) sheet.getRange(i + 1, 2).setValue(e.parameter.name);
      if (e.parameter.amount !== undefined) sheet.getRange(i + 1, 3).setValue(parseFloat(e.parameter.amount));
      if (e.parameter.quantity !== undefined) sheet.getRange(i + 1, 4).setValue(parseFloat(e.parameter.quantity));
      sheet.getRange(i + 1, 5).setValue(new Date());
      
      // Get updated values and calculate total
      const amount = parseFloat(sheet.getRange(i + 1, 3).getValue()) || 0;
      const quantity = parseFloat(sheet.getRange(i + 1, 4).getValue()) || 0;
      const total = amount * quantity;
      
      return output({ status: "success", message: "Updated", total: total });
    }
  }
  return output({ status: "error", message: "ID not found" });
}

function deleteProduct(e) {
  const sheet = getProductSheet();
  const id = e.parameter.id;
  const data = sheet.getDataRange().getValues();
  for (let i = 1; i < data.length; i++) {
    if (data[i][0] == id) {
      sheet.deleteRow(i + 1);
      return output({ status: "success", message: "Deleted" });
    }
  }
  return output({ status: "error", message: "ID not found" });
}

// =====================================================
// 🧮 CALCULATION HELPERS
// =====================================================

function calculateProductTotalCost() {
  const productSheet = getProductSheet();
  const productData = productSheet.getDataRange().getValues();
  let productTotalCost = 0;
  for (let i = 1; i < productData.length; i++) {
    if (!productData[i][0]) continue;
    const amount = parseFloat(productData[i][2]) || 0;
    const quantity = parseFloat(productData[i][3]) || 0;
    productTotalCost += (amount * quantity);
  }
  return productTotalCost;
}

function getProductsList() {
  const productSheet = getProductSheet();
  const productData = productSheet.getDataRange().getValues();
  let products = [];
  for (let i = 1; i < productData.length; i++) {
    if (!productData[i][0]) continue;
    const name = productData[i][1] || "";
    const amount = parseFloat(productData[i][2]) || 0;
    const quantity = parseFloat(productData[i][3]) || 0;
    const total = amount * quantity;
    products.push({
      id: productData[i][0],
      name: name,
      amount: amount,
      quantity: quantity,
      timestamp: productData[i][4],
      total: total
    });
  }
  return products;
}

function calculateStaffTotal() {
  const staffSheet = getStaffCalcSheet();
  const staffData = staffSheet.getDataRange().getValues();
  let staffTotal = 0;
  for (let i = 1; i < staffData.length; i++) {
    if (!staffData[i][0]) continue;
    const amount = parseFloat(staffData[i][2]) || 0;
    const numberOfMonths = parseFloat(staffData[i][3]) || 0;
    const noOfStaff = parseFloat(staffData[i][4]) || 0;
    staffTotal += (amount * numberOfMonths * noOfStaff);
  }
  return staffTotal;
}

function getStaffList() {
  const staffSheet = getStaffCalcSheet();
  const staffData = staffSheet.getDataRange().getValues();
  let staffList = [];
  for (let i = 1; i < staffData.length; i++) {
    if (!staffData[i][0]) continue;
    const name = staffData[i][1] || "";
    const amount = parseFloat(staffData[i][2]) || 0;
    const months = parseFloat(staffData[i][3]) || 0;
    const staff = parseFloat(staffData[i][4]) || 0;
    const total = amount * months * staff;
    staffList.push({
      id: staffData[i][0],
      name: name,
      amount: amount,
      numberOfMonths: months,
      noOfStaff: staff,
      timestamp: staffData[i][5],
      total: total
    });
  }
  return staffList;
}

// =====================================================
// 🎯 MAIN CALCULATION WITH PROFIT
// =====================================================

function calculateSchoolRevenues() {
  // Get current revenue values from Revenue sheet
  const revenueSheet = getRevenueSheet();
  let school1Revenue = 0;
  let school2Revenue = 0;
  let school3Revenue = 0;
  
  if (revenueSheet) {
    const revenueRow = revenueSheet.getRange("A2:D2").getValues()[0];
    school1Revenue = parseFloat(revenueRow[0]) || 0;
    school2Revenue = parseFloat(revenueRow[1]) || 0;
    school3Revenue = parseFloat(revenueRow[2]) || 0;
  }
  
  // Calculate totals
  const productTotalCost = calculateProductTotalCost();
  const staffTotal = calculateStaffTotal();
  const productsList = getProductsList();
  const staffList = getStaffList();
  
  // Calculate material costs per product for each school
  let materialCostsPerProduct = [];
  let materialCosts = { school1: 0, school2: 0, school3: 0 };
  let staffCosts = { school1: 0, school2: 0, school3: 0 };
  
  // For each product, distribute its total to each school
  for (let i = 0; i < productsList.length; i++) {
    const productTotal = productsList[i].total;
    let productDistribution = { school1: 0, school2: 0, school3: 0 };
    
    if (school3Revenue === 0) {
      // Only first 2 schools get this product
      productDistribution.school1 = productTotal;
      productDistribution.school2 = productTotal;
      productDistribution.school3 = 0;
    } else if (school3Revenue > 0) {
      // All 3 schools get this product
      productDistribution.school1 = productTotal;
      productDistribution.school2 = productTotal;
      productDistribution.school3 = productTotal;
    }
    
    // Add to totals
    materialCosts.school1 += productDistribution.school1;
    materialCosts.school2 += productDistribution.school2;
    materialCosts.school3 += productDistribution.school3;
    
    // Store individual product distribution
    materialCostsPerProduct.push({
      product: productsList[i],
      distribution: productDistribution
    });
  }
  
  let calculatedRevenues = { school1: 0, school2: 0 };
  
  // Conditional logic based on school3 value
  if (school3Revenue === 0) {
    // Only first 2 schools
    staffCosts.school1 = staffTotal;
    staffCosts.school2 = 0;
    staffCosts.school3 = 0;
    
    calculatedRevenues.school1 = productTotalCost + staffTotal;
    calculatedRevenues.school2 = productTotalCost;
  } else if (school3Revenue > 0) {
    // All 3 schools active
    staffCosts.school1 = staffTotal;
    staffCosts.school2 = 0;
    staffCosts.school3 = 0;
    
    calculatedRevenues.school1 = productTotalCost + staffTotal;
    calculatedRevenues.school2 = productTotalCost;
    calculatedRevenues.school3 = productTotalCost;
  }
  
  // Calculate totals
  const revenueTotal = school1Revenue + school2Revenue + school3Revenue;
  const calculatedRevenuesTotal = calculatedRevenues.school1 + calculatedRevenues.school2 + (calculatedRevenues.school3 || 0);
  const profitWithMaterial = revenueTotal - calculatedRevenuesTotal;
  
  // Update the Revenue Sheet with calculated values
  if (revenueSheet) {
    revenueSheet.getRange("A2:C2").setValues([[
      calculatedRevenues.school1, 
      calculatedRevenues.school2, 
      calculatedRevenues.school3 || 0
    ]]);
    revenueSheet.getRange("D2").setValue(new Date());
  }
  
  // Prepare response
  const response = {
    status: "success",
    revenue: {
      school1: school1Revenue,
      school2: school2Revenue,
      school3: school3Revenue,
      timestamp: revenueSheet ? revenueSheet.getRange("D2").getValue() : null
    },
    revenue_total: revenueTotal,
    calculated_revenues: calculatedRevenues,
    calculated_revenues_total: calculatedRevenuesTotal,
    profit_with_material: profitWithMaterial,
    material_costs: materialCosts,
    material_costs_per_product: materialCostsPerProduct,
    staff_costs: staffCosts,
    calculation_details: {
      product_total_cost: productTotalCost,
      products_list: productsList,
      staff_total: staffTotal,
      staff_list: staffList,
      formula_used: school3Revenue === 0 ? "Only first 2 schools calculated" : "All 3 schools calculated"
    }
  };
  
  response.timestamp = new Date();
  
  return output(response);
}

// =====================================================
// 📊 GET ALL DATA WITH PROFIT (STUDENT RECORDS REMOVED)
// =====================================================

function getAllData() {
  // Get Revenue Data
  const revenueSheet = getRevenueSheet();
  let revenueData = { school1: 0, school2: 0, school3: 0, timestamp: null };
  let revenueTotal = 0;
  
  if (revenueSheet) {
    const revenueRow = revenueSheet.getRange("A2:D2").getValues()[0];
    revenueData = {
      school1: parseFloat(revenueRow[0]) || 0,
      school2: parseFloat(revenueRow[1]) || 0,
      school3: parseFloat(revenueRow[2]) || 0,
      timestamp: revenueRow[3] || null
    };
    revenueTotal = revenueData.school1 + revenueData.school2 + revenueData.school3;
  }
  
  // Get Staff Calculations
  const staffSheet = getStaffCalcSheet();
  let staffRecords = [];
  let staffGrandTotal = 0;
  const staffData = staffSheet.getDataRange().getValues();
  if (staffData.length > 1) {
    const staffHeaders = staffData[0];
    for (let i = 1; i < staffData.length; i++) {
      if (!staffData[i][0]) continue;
      let obj = {};
      for (let j = 0; j < staffHeaders.length; j++) {
        obj[staffHeaders[j]] = staffData[i][j];
      }
      const amount = parseFloat(staffData[i][2]) || 0;
      const months = parseFloat(staffData[i][3]) || 0;
      const staff = parseFloat(staffData[i][4]) || 0;
      const total = amount * months * staff;
      obj.total = total;
      staffGrandTotal += total;
      staffRecords.push(obj);
    }
  }
  
  // Get Products
  const productSheet = getProductSheet();
  let productRecords = [];
  let productGrandTotal = 0;
  const productData = productSheet.getDataRange().getValues();
  if (productData.length > 1) {
    const productHeaders = productData[0];
    for (let i = 1; i < productData.length; i++) {
      if (!productData[i][0]) continue;
      let obj = {};
      for (let j = 0; j < productHeaders.length; j++) {
        obj[productHeaders[j]] = productData[i][j];
      }
      const amount = parseFloat(productData[i][2]) || 0;
      const quantity = parseFloat(productData[i][3]) || 0;
      const total = amount * quantity;
      obj.total = total;
      productGrandTotal += total;
      productRecords.push(obj);
    }
  }
  
  // Calculate conditional revenues and costs
  const productTotalCost = productGrandTotal;
  const staffTotal = staffGrandTotal;
  const school3Value = revenueData.school3;
  const activeSchools = school3Value > 0 ? 3 : 2;
  
  let calculatedRevenues = { school1: 0, school2: 0 };
  let materialCosts = { school1: 0, school2: 0, school3: 0 };
  let staffCosts = { school1: 0, school2: 0, school3: 0 };
  let materialCostsPerProduct = [];
  
  // For each product, distribute its total to each school
  for (let i = 0; i < productRecords.length; i++) {
    const productTotal = productRecords[i].total;
    let productDistribution = { school1: 0, school2: 0, school3: 0 };
    
    if (school3Value === 0) {
      // Only first 2 schools get this product
      productDistribution.school1 = productTotal;
      productDistribution.school2 = productTotal;
      productDistribution.school3 = 0;
    } else if (school3Value > 0) {
      // All 3 schools get this product
      productDistribution.school1 = productTotal;
      productDistribution.school2 = productTotal;
      productDistribution.school3 = productTotal;
    }
    
    // Add to totals
    materialCosts.school1 += productDistribution.school1;
    materialCosts.school2 += productDistribution.school2;
    materialCosts.school3 += productDistribution.school3;
    
    // Store individual product distribution
    materialCostsPerProduct.push({
      product: productRecords[i],
      distribution: productDistribution
    });
  }
  
  if (school3Value === 0) {
    // Only first 2 schools
    staffCosts.school1 = staffTotal;
    staffCosts.school2 = 0;
    staffCosts.school3 = 0;
    
    calculatedRevenues.school1 = productTotalCost + staffTotal;
    calculatedRevenues.school2 = productTotalCost;
  } else if (school3Value > 0) {
    // All 3 schools active
    staffCosts.school1 = staffTotal;
    staffCosts.school2 = 0;
    staffCosts.school3 = 0;
    
    calculatedRevenues.school1 = productTotalCost + staffTotal;
    calculatedRevenues.school2 = productTotalCost;
    calculatedRevenues.school3 = productTotalCost;
  }
  
  const calculatedRevenuesTotal = calculatedRevenues.school1 + calculatedRevenues.school2 + (calculatedRevenues.school3 || 0);
  const profitWithMaterial = revenueTotal - calculatedRevenuesTotal;
  const totalMaterialCost = materialCosts.school1 + materialCosts.school2 + materialCosts.school3;
  
  return output({
    status: "success",
    data: {
      revenue: revenueData,
      revenue_total: revenueTotal,
      staff_calculations: staffRecords,
      staff_grand_total: staffGrandTotal,
      products: productRecords,
      product_grand_total: productGrandTotal,
      calculated_revenues: calculatedRevenues,
      calculated_revenues_total: calculatedRevenuesTotal,
      profit_with_material: profitWithMaterial,
      material_costs: materialCosts,
      material_costs_per_product: materialCostsPerProduct,
      staff_costs: staffCosts
    },
    summary: {
      total_products: productRecords.length,
      total_staff_calculations: staffRecords.length,
      active_schools: activeSchools,
      total_material_cost: totalMaterialCost,
      staff_total: staffTotal,
      calculation_condition: school3Value === 0 ? "Only first 2 schools calculated" : "All 3 schools calculated"
    }
  });
}
