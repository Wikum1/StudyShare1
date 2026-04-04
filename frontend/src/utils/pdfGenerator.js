import jsPDF from "jspdf";

export const generateDayPlannerPDF = (date, tasks, planName) => {
  const doc = new jsPDF();
  
  // Set colors for the PDF
  const primaryColor = [37, 99, 235]; // Blue
  const headerColor = [15, 23, 42]; // Dark
  const textColor = [31, 41, 55]; // Dark gray
  const lightGray = [245, 245, 245];
  const borderColor = [226, 232, 240];
  
  // Format date
  const dateObj = new Date(date);
  const options = { 
    weekday: "long", 
    year: "numeric", 
    month: "long", 
    day: "numeric" 
  };
  const formattedDate = dateObj.toLocaleDateString("en-US", options);
  
  // Title
  doc.setTextColor(...headerColor);
  doc.setFontSize(22);
  doc.text("Day Planner", 20, 18);
  
  // Date
  doc.setTextColor(...primaryColor);
  doc.setFontSize(12);
  doc.text(formattedDate, 20, 26);
  
  // Plan name
  if (planName) {
    doc.setTextColor(...textColor);
    doc.setFontSize(10);
    doc.text(`Study Plan: ${planName}`, 20, 32);
  }
  
  // Separator
  doc.setDrawColor(...borderColor);
  doc.setLineWidth(0.5);
  doc.line(20, 36, 190, 36);
  
  // If no tasks
  if (!tasks || tasks.length === 0) {
    doc.setTextColor(150, 150, 150);
    doc.setFontSize(11);
    doc.text("No tasks scheduled for this day.", 20, 50);
    doc.save(`day-planner-${formattedDate.replace(/\s+/g, "-")}.pdf`);
    return;
  }
  
  // Create timeline with all hours
  let yPosition = 44;
  const pageHeight = doc.internal.pageSize.height;
  const margin = 20;
  
  // Table settings
  const tableLeft = margin;
  const tableRight = 190;
  const colWidths = {
    time: 25,
    task: 100,
    priority: 30
  };
  
  // Group tasks by hour
  const tasksByHour = {};
  for (let hour = 0; hour < 24; hour++) {
    tasksByHour[hour] = [];
  }
  
  tasks.forEach(task => {
    const hour = parseInt(task.time.split(":")[0]);
    tasksByHour[hour].push(task);
  });
  
  // Sort tasks within each hour by minute
  Object.keys(tasksByHour).forEach(hour => {
    tasksByHour[hour].sort((a, b) => {
      const minA = parseInt(a.time.split(":")[1]);
      const minB = parseInt(b.time.split(":")[1]);
      return minA - minB;
    });
  });
  
  // Table header
  doc.setFillColor(15, 23, 42);
  doc.setTextColor(255, 255, 255);
  doc.setFont(undefined, "bold");
  doc.setFontSize(10);
  
  const headerY = yPosition;
  doc.rect(tableLeft, headerY - 4, tableRight - tableLeft, 8, "F");
  
  doc.text("Time", tableLeft + 2, yPosition);
  doc.text("Task", tableLeft + colWidths.time + 2, yPosition);
  doc.text("Priority", tableLeft + colWidths.time + colWidths.task + 2, yPosition);
  
  yPosition += 10;
  
  // Timeline entries
  const priorityColors = {
    high: [220, 38, 38],
    medium: [245, 158, 11],
    low: [16, 185, 129]
  };
  
  let rowCounter = 0;
  for (let hour = 0; hour < 24; hour++) {
    const hoursTaskList = tasksByHour[hour];
    
    if (hoursTaskList.length > 0) {
      hoursTaskList.forEach((task) => {
        // Check if we need new page
        if (yPosition > pageHeight - 25) {
          doc.addPage();
          yPosition = 20;
          rowCounter = 0;
        }
        
        const rowHeight = 7;
        
        // Alternate row background
        if (rowCounter % 2 === 0) {
          doc.setFillColor(245, 245, 245);
          doc.rect(tableLeft, yPosition - 3.5, tableRight - tableLeft, rowHeight, "F");
        }
        
        // Row border
        doc.setDrawColor(...borderColor);
        doc.setLineWidth(0.3);
        doc.line(tableLeft, yPosition + 2.5, tableRight, yPosition + 2.5);
        
        // Time
        doc.setTextColor(...primaryColor);
        doc.setFont(undefined, "bold");
        doc.setFontSize(9);
        doc.text(task.time, tableLeft + 2, yPosition);
        
        // Task title (truncated)
        doc.setTextColor(...textColor);
        doc.setFont(undefined, "normal");
        doc.setFontSize(9);
        const taskTitle = task.title.length > 50 ? task.title.substring(0, 47) + "..." : task.title;
        doc.text(taskTitle, tableLeft + colWidths.time + 2, yPosition);
        
        // Priority
        const priorityText = (task.priority || "medium").toUpperCase();
        const priorityColor = priorityColors[task.priority || "medium"];
        doc.setTextColor(...priorityColor);
        doc.setFont(undefined, "bold");
        doc.setFontSize(8);
        doc.text(priorityText, tableLeft + colWidths.time + colWidths.task + 2, yPosition);
        
        yPosition += rowHeight;
        rowCounter++;
      });
    }
  }
  
  // Final bottom border
  doc.setDrawColor(...borderColor);
  doc.setLineWidth(0.5);
  doc.line(tableLeft, yPosition + 1, tableRight, yPosition + 1);
  
  // Footer
  const footerY = pageHeight - 10;
  doc.setTextColor(150, 150, 150);
  doc.setFontSize(8);
  doc.setFont(undefined, "normal");
  doc.text(
    `Generated on ${new Date().toLocaleString()}`,
    margin,
    footerY
  );
  doc.text(
    "StudyShare",
    190 - margin,
    footerY,
    { align: "right" }
  );
  
  // Save PDF
  doc.save(`day-planner-${formattedDate.replace(/\s+/g, "-")}.pdf`);
};
