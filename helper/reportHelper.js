const { Document, Packer, Table, TableRow, TableCell, Paragraph, TextRun } = require('docx');

const generateReport = async (complaints, filters) => {
  const doc = new Document();

  // Add title
  doc.addSection({
    properties: {},
    children: [
      new Paragraph({
        children: [
          new TextRun('Complaint Report'),
        ],
      }),
    ],
  });

  // Add filters applied to the report
  const filterParagraph = new Paragraph({
    children: [
      new TextRun('Filters Applied: '),
      new TextRun(JSON.stringify(filters, null, 2)),
    ],
  });

  doc.addSection({
    children: [filterParagraph],
  });

  // Create the table for complaints
  const tableRows = [
    new TableRow({
      children: [
        new TableCell({
          children: [new Paragraph('S. No')],
        }),
        new TableCell({
          children: [new Paragraph('Raiser Name')],
        }),
        new TableCell({
          children: [new Paragraph('Subject')],
        }),
        new TableCell({
          children: [new Paragraph('Date')],
        }),
        new TableCell({
          children: [new Paragraph('Details')],
        }),
        new TableCell({
          children: [new Paragraph('Department')],
        }),
        new TableCell({
          children: [new Paragraph('Premises')],
        }),
        new TableCell({
          children: [new Paragraph('Location')],
        }),
        new TableCell({
          children: [new Paragraph('Price')],
        }),
        new TableCell({
          children: [new Paragraph('Duration (Days)')],
        }),
      ],
    }),
  ];

  let totalPrice = 0;

  complaints.forEach((complaint, index) => {
    if (!complaint) {
      console.log(`Complaint at index ${index} is undefined or null.`);
      return; // Skip this iteration
    }
  
    // Safe extraction of fields with fallback values
    const creator = complaint?.creator || 'N/A';
    const raiserName = complaint?.raiserName || 'N/A';
    const subject = complaint?.subject || 'N/A';
    const date = complaint?.date ? new Date(complaint.date).toLocaleDateString() : 'N/A';
    const details = complaint?.details || 'N/A';
    const department = complaint?.department || 'N/A';
    const premises = complaint?.premises || 'N/A';
    const location = complaint?.location || 'N/A';
    const price = complaint?.price || 0;
    const duration = complaint?.resolvedAt && complaint?.createdAt
      ? Math.ceil((new Date(complaint.resolvedAt) - new Date(complaint.createdAt)) / (1000 * 60 * 60 * 24))
      : 'N/A';
  
    console.log(`Processing complaint ${index + 1}:`, {
      creator,
      raiserName,
      subject,
      date,
      details,
      department,
      premises,
      location,
      price,
      duration,
    });
  
    // Build table rows safely
    tableRows.push(
      new TableRow({
        children: [
          new TableCell({ children: [new Paragraph((index + 1).toString())] }),
          new TableCell({ children: [new Paragraph(raiserName)] }),
          new TableCell({ children: [new Paragraph(subject)] }),
          new TableCell({ children: [new Paragraph(date)] }),
          new TableCell({ children: [new Paragraph(details)] }),
          new TableCell({ children: [new Paragraph(department)] }),
          new TableCell({ children: [new Paragraph(premises)] }),
          new TableCell({ children: [new Paragraph(location)] }),
          new TableCell({ children: [new Paragraph(price.toString())] }),
          new TableCell({ children: [new Paragraph(duration.toString())] }),
        ],
      })
    );
  });  

  // Add the table with complaint data
  doc.addSection({
    children: [
      new Table({
        rows: tableRows,
      }),
    ],
  });

  // Add total price at the end
  doc.addSection({
    children: [
      new Paragraph({
        children: [
          new TextRun(`Total Price: ${totalPrice}`),
        ],
      }),
    ],
  });
  console.log("hi");

  // Convert the document to a buffer to send in the response
  const buffer = await Packer.toBuffer(doc);
  return buffer;
};

module.exports = { generateReport };
