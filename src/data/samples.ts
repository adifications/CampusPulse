import { DemoSample } from '../types';

export const DEMO_SAMPLES: DemoSample[] = [
  {
    id: 'campus-board-full',
    name: 'Main Academic Quad Board (Filtered by Dept)',
    badge: 'Campus Central Board',
    description: 'Central campus board containing College-wide Exam Fees, CSE Placement Cohort, Hostel Clearance, and Mech/Civil lab notices.',
    imageUrl: 'https://images.unsplash.com/photo-1577495508048-b635879837f1?auto=format&fit=crop&w=1200&q=80',
    simulatedData: {
      boardTitle: 'Academic Complex Notice Board - Block A (Autumn 2026)',
      scanTimestamp: '2026-09-18T09:30:00Z',
      totalNoticesFound: 6,
      criticalCount: 1,
      highCount: 2,
      executiveSummary: 'Detected 6 notices spanning College-Wide examination fees, CSE placement registrations, hostel room clearance, and branch-specific workshops. Active filtering ensures students only see college-wide rules plus their own department updates.',
      urgentBroadcastMessage: `📢 *CAMPUS NOTICE BOARD DIGEST (18 Sept 2026)*

🚨 *COLLEGE-WIDE CRITICAL: Exam Fee & Hall Ticket Cutoff*
• Deadline: *Sept 22, 2026 (5:00 PM)*
• Fee: ₹2,400 regular (₹500 late fine till Sept 25).
• Unpaid students will NOT receive exam hall tickets.

💼 *CSE / IT / ECE: Placement Drive (Google & Atlassian)*
• Registration closes: *Sept 24, 2026 (11:59 PM)*
• Eligibility: 7.0+ CGPA, 0 backlogs.

🏠 *ALL BOARDERS: Hostel Re-Allotment Clearance*
• Submit room clearance slip before Oct 02.`,
      notices: [
        {
          id: 'notice-exam-fees-2026',
          title: 'End-Sem Exam Fee & Hall Ticket Strict Cutoff',
          officialTitle: 'Notification No. COE/2026/089: Submission of Examination Forms & Fee Remittance for Autumn Semester 2026',
          department: 'Office of the Controller of Examinations',
          referenceNumber: 'COE/AUTUMN/2026/089',
          issueDate: '15 Sept 2026',
          category: 'Exams & Fees',
          importance: 'CRITICAL',
          relevantDepartments: ['ALL'],
          whyItMatters: 'Mandatory college-wide: Failure to pay by Sept 22 permanently blocks your hall ticket generation.',
          oneLineTLDR: 'Pay ₹2,400 exam fee on Student ERP before Sept 22 (5:00 PM) to get your examination hall ticket.',
          bulletPoints: [
            'Regular fee payment closes on September 22 at 5:00 PM sharp.',
            'Regular amount: ₹2,400. Backlog fee: ₹350 per paper.',
            'Late fine window: Sept 23–25 with non-negotiable ₹500 penalty.',
            'ERP generates hall ticket 48 hours post-clearance.',
          ],
          actionItems: [
            {
              text: 'Log into Student ERP > Exam Management > Autumn 2026 Fee',
              deadline: '22 Sept 2026, 5:00 PM',
              isUrgent: true,
              feeAmount: '₹2,400',
              linkOrVenue: 'https://erp.campus.edu/student/exams',
            },
            {
              text: 'Save transaction UTR receipt for verification',
              isUrgent: false,
            },
          ],
          deadlines: [
            {
              date: '2026-09-22',
              time: '17:00 IST',
              description: 'Regular exam fee deadline (no fine)',
              isStrictCutoff: true,
              penaltyIfMissed: 'Late fine of ₹500 starts Sept 23',
            },
            {
              date: '2026-09-25',
              time: '17:00 IST',
              description: 'Final cutoff with late fine',
              isStrictCutoff: true,
              penaltyIfMissed: 'Debarred from Autumn 2026 exams',
            },
          ],
          targetAudience: ['All College Students (UG & PG)'],
          feesAndFines: {
            hasFee: true,
            amount: '₹2,400',
            lateFine: '₹500 (from Sept 23 to 25)',
            paymentMode: 'ERP online NetBanking/UPI/Card',
          },
          contactPerson: {
            name: 'Dr. V. Ramanathan',
            designation: 'Assistant Controller of Examinations',
            office: 'Admin Block, Room 104',
            emailOrPhone: 'coe-helpdesk@campus.edu',
          },
          noticePositionOnBoard: {
            locationDescription: 'Top Left (Pinned with red magnet)',
            estimatedBoundingBox: { ymin: 40, xmin: 50, ymax: 480, xmax: 460 },
          },
          originalSnippet: '...Candidates defaulting payment shall not be assigned seat matrices or hall tickets...',
        },
        {
          id: 'notice-placement-drive-2026',
          title: 'Campus Placement Registration: Tech Cohort Phase-1',
          officialTitle: 'Circular Ref: T&P/2026-27/PH1-04: Mandatory Resume Freeze & Company Shortlisting for Phase-1 Recruitment',
          department: 'Training & Placement Cell (T&P)',
          referenceNumber: 'T&P/2026-27/PH1-04',
          issueDate: '16 Sept 2026',
          category: 'Placements & Internships',
          importance: 'HIGH',
          relevantDepartments: ['CS', 'ECE', 'MCA', 'MTECH'],
          whyItMatters: 'Missing the resume freeze locks you out of Day-1 campus interviews with Google, Atlassian, and Cisco.',
          oneLineTLDR: 'CS, ECE, MCA & M.Tech graduating batches must freeze verified master resumes on Superset before Sept 24 (11:59 PM).',
          bulletPoints: [
            'Applicable to graduating batch in CS, ECE, MCA, and M.Tech.',
            'Eligibility: 7.0+ CGPA with zero active backlogs.',
            'Standard single-page T&P resume format must be uploaded to Superset.',
            'Pre-placement company talks begin Sept 27 in Main Auditorium.',
          ],
          actionItems: [
            {
              text: 'Upload 1-page PDF resume on Superset and click Freeze Profile',
              deadline: '24 Sept 2026, 11:59 PM',
              isUrgent: true,
              linkOrVenue: 'https://app.joinsuperset.com/campus',
            },
          ],
          deadlines: [
            {
              date: '2026-09-24',
              time: '23:59 IST',
              description: 'Mandatory profile freeze on Superset portal',
              isStrictCutoff: true,
              penaltyIfMissed: 'Excluded from Day-1 and Day-2 recruitments',
            },
          ],
          targetAudience: ['Final Year B.Tech (CSE, IT, ECE)'],
          feesAndFines: {
            hasFee: false,
          },
          contactPerson: {
            name: 'Prof. Ananya Sen',
            designation: 'Head, Training & Placement',
            office: 'Career Center, 2nd Floor, SAC',
            emailOrPhone: 'placements@campus.edu',
          },
          noticePositionOnBoard: {
            locationDescription: 'Top Right (White paper with blue header)',
            estimatedBoundingBox: { ymin: 40, xmin: 520, ymax: 470, xmax: 950 },
          },
        },
        {
          id: 'notice-hostel-room-allotment',
          title: 'Hostel Room Re-Allotment & Caution Deposit Refund',
          officialTitle: 'Notification No. CHM/2026/W2: Clearance Protocols for Hostel Residents Vacating or Shifting Blocks',
          department: 'Chief Warden Office',
          referenceNumber: 'CHM/2026/W2',
          issueDate: '14 Sept 2026',
          category: 'Hostel & Mess',
          importance: 'NORMAL',
          relevantDepartments: ['ALL'],
          whyItMatters: 'Submit room inventory clearance to get your ₹5,000 caution deposit refunded without deductions.',
          oneLineTLDR: 'All hostellers vacating or swapping rooms must submit caretaker-signed clearance by Oct 02.',
          bulletPoints: [
            'Applies to all residents across Hostels H1 to H9.',
            'No-dues clearance verifies room inventory (furniture, fan, electrical fixtures).',
            'Mess deposit balance automatically credited to bank account within 14 days.',
          ],
          actionItems: [
            {
              text: 'Collect physical clearance slip from Hostel Warden Office',
              deadline: '02 Oct 2026',
              isUrgent: false,
              linkOrVenue: 'Hostel Warden Office (Hostel 3)',
            },
          ],
          deadlines: [
            {
              date: '2026-10-02',
              time: '18:00 IST',
              description: 'Last date for room clearance slip submission',
              isStrictCutoff: false,
              penaltyIfMissed: '₹500 maintenance surcharge deducted from deposit',
            },
          ],
          targetAudience: ['All Hostel Boarders'],
          feesAndFines: {
            hasFee: false,
          },
          contactPerson: {
            name: 'Mr. Rajesh Kulkarni',
            designation: 'Senior Hostel Supervisor',
            office: 'Hostel Central Office',
            emailOrPhone: 'hostel-clearance@campus.edu',
          },
          noticePositionOnBoard: {
            locationDescription: 'Bottom Left',
            estimatedBoundingBox: { ymin: 520, xmin: 50, ymax: 950, xmax: 480 },
          },
        },
        {
          id: 'notice-innovate-hackathon-2026',
          title: 'National Collegiate Hackathon "Innovate AI 2026"',
          officialTitle: 'Announcement: 36-Hour National Collegiate Hackathon by Innovation & Incubation Council',
          department: 'Innovation & Incubation Council',
          referenceNumber: 'I&E/HACK/2026-03',
          issueDate: '17 Sept 2026',
          category: 'Events & Clubs',
          importance: 'NORMAL',
          relevantDepartments: ['ALL'],
          whyItMatters: 'Cash prizes of ₹1,50,000, seed funding fast-track, and internship interviews with sponsors.',
          oneLineTLDR: 'Assemble 3-4 member teams and register before Sept 28; free entry with 36-hour lab access.',
          bulletPoints: [
            'Physical hackathon from Oct 10 to Oct 12 in Campus Innovation Hub.',
            'Themes: Campus AI, Sustainability, FinTech, and MedTech.',
            'Open to all students across CS, ECE, EEE, MECH, CIVIL, MCA, and M.Tech.',
          ],
          actionItems: [
            {
              text: 'Register team of 3-4 on Devfolio portal',
              deadline: '28 Sept 2026, 23:59 IST',
              isUrgent: false,
              linkOrVenue: 'https://campus-innovate2026.devfolio.co',
            },
          ],
          deadlines: [
            {
              date: '2026-09-28',
              time: '23:59 IST',
              description: 'Team registration & abstract submission',
              isStrictCutoff: true,
            },
          ],
          targetAudience: ['All College Students'],
          feesAndFines: {
            hasFee: false,
          },
          contactPerson: {
            name: 'Student Lead: Rahul',
            office: 'Innovation Lab 201',
            emailOrPhone: 'innovate2026@campus.edu',
          },
          noticePositionOnBoard: {
            locationDescription: 'Bottom Right',
            estimatedBoundingBox: { ymin: 520, xmin: 520, ymax: 950, xmax: 950 },
          },
        },
        {
          id: 'notice-mechanical-workshop',
          title: 'Mechanical Workshop: Advanced 5-Axis CNC & CAM Training',
          officialTitle: 'Circular ME/WKS/2026/08: Mandatory Industrial CNC Certification for 3rd Year Mechanical',
          department: 'Department of Mechanical Engineering',
          referenceNumber: 'ME/WKS/2026/08',
          issueDate: '16 Sept 2026',
          category: 'Academics & Classes',
          importance: 'HIGH',
          relevantDepartments: ['MECH'],
          whyItMatters: 'Mandatory practical certification for 5th semester Mechanical engineering lab credits.',
          oneLineTLDR: 'Mechanical students must enroll in the 3-day CNC practical batch before Sept 23 at the Central Workshop.',
          bulletPoints: [
            'Hands-on MasterCAM and Haas 5-Axis CNC machine programming.',
            'Safety shoes and lab coats strictly required for entry.',
            'Batch allocation list posted on Workshop notice board.',
          ],
          actionItems: [
            {
              text: 'Sign up for preferred lab batch at Central Workshop Office',
              deadline: '23 Sept 2026, 4:00 PM',
              isUrgent: true,
              linkOrVenue: 'Central Machine Shop Room 102',
            },
          ],
          deadlines: [
            {
              date: '2026-09-23',
              time: '16:00 IST',
              description: 'CNC Workshop batch registration closure',
              isStrictCutoff: true,
            },
          ],
          targetAudience: ['3rd Year Mechanical Engineering'],
          feesAndFines: {
            hasFee: false,
          },
          contactPerson: {
            name: 'Prof. S. R. Joshi',
            office: 'Mechanical Dept Level 1',
            emailOrPhone: 'mech-workshop@campus.edu',
          },
        },
        {
          id: 'notice-civil-survey-camp',
          title: 'Civil Engineering: Total Station & GIS Survey Camp 2026',
          officialTitle: 'Notification CE/CAMP/2026/02: Compulsory Geological & Topographical Survey Camp Schedule',
          department: 'Department of Civil Engineering',
          referenceNumber: 'CE/CAMP/2026/02',
          issueDate: '15 Sept 2026',
          category: 'Academics & Classes',
          importance: 'HIGH',
          relevantDepartments: ['CIVIL'],
          whyItMatters: 'Mandatory 4-day residential field survey camp carrying 2 core course credits.',
          oneLineTLDR: 'Civil 3rd-year students must submit camp consent forms and equipment security deposit by Sept 25.',
          bulletPoints: [
            '4-day field survey at Valley Hydro Project site from Oct 14-17.',
            'Covers Drone LiDAR mapping, GPS triangulation, and Total Station survey.',
            'Submit parental consent letter and medical fitness declaration.',
          ],
          actionItems: [
            {
              text: 'Submit signed parental consent form to Civil HOD office',
              deadline: '25 Sept 2026, 5:00 PM',
              isUrgent: true,
              linkOrVenue: 'Civil Engineering HOD Office',
            },
          ],
          deadlines: [
            {
              date: '2026-09-25',
              time: '17:00 IST',
              description: 'Survey camp consent submission deadline',
              isStrictCutoff: true,
            },
          ],
          targetAudience: ['3rd Year Civil Engineering'],
          feesAndFines: {
            hasFee: false,
          },
          contactPerson: {
            name: 'Dr. Neha Verma',
            office: 'Survey Lab Room 15',
            emailOrPhone: 'civil-survey@campus.edu',
          },
        },
        {
          id: 'notice-eee-smart-grid',
          title: 'EEE: Smart Grid SCADA & Renewable Integration Workshop',
          officialTitle: 'Notice EEE/SEM5/2026-11: Mandatory Practical Simulation Certification on MATLAB/Simulink Power Systems',
          department: 'Department of Electrical & Electronics Engineering',
          referenceNumber: 'EEE/SEM5/2026-11',
          issueDate: '16 Sept 2026',
          category: 'Academics & Classes',
          importance: 'HIGH',
          relevantDepartments: ['EEE'],
          whyItMatters: 'Mandatory industrial skill certification required for 6th-semester electrical transmission credits.',
          oneLineTLDR: 'EEE 3rd & 4th-year students must register for IEEE Smart Grid simulation batch before Sept 26.',
          bulletPoints: [
            'Hands-on microgrid stability, relay coordination, and solar inverter sync.',
            'Industry trainer from PowerGrid Corporation of India.',
            'Limited to 45 seats per lab batch in Power Systems Simulation Lab.',
          ],
          actionItems: [
            {
              text: 'Register slot with EEE Lab Coordinator (Room E-204)',
              deadline: '26 Sept 2026, 4:00 PM',
              isUrgent: true,
              linkOrVenue: 'Electrical Machine Lab 2',
            },
          ],
          deadlines: [
            {
              date: '2026-09-26',
              time: '16:00 IST',
              description: 'Smart Grid lab slot registration cutoff',
              isStrictCutoff: true,
            },
          ],
          targetAudience: ['3rd & 4th Year Electrical Engineering (EEE)'],
          feesAndFines: {
            hasFee: false,
          },
          contactPerson: {
            name: 'Dr. S. K. Nair',
            office: 'EEE Dept Block B',
            emailOrPhone: 'eee-labs@campus.edu',
          },
        },
        {
          id: 'notice-mca-cloud-hack',
          title: 'MCA: Cloud Architecture & Kubernetes Masterclass',
          officialTitle: 'Notification MCA/PG/2026/05: Industry Certification in Distributed Microservices & DevOps',
          department: 'Department of Computer Applications (MCA)',
          referenceNumber: 'MCA/PG/2026/05',
          issueDate: '17 Sept 2026',
          category: 'Placements & Internships',
          importance: 'HIGH',
          relevantDepartments: ['MCA'],
          whyItMatters: 'Mandatory pre-placement boot camp for Cloud and Full-Stack campus interview rounds.',
          oneLineTLDR: 'MCA students must configure AWS Student Cloud Sandboxes and register GitHub handles before Sept 25.',
          bulletPoints: [
            'Includes AWS Cloud Architect voucher discounts.',
            'Practical deployment sprint on Docker containers and Kubernetes clusters.',
            'Attendance will be counted directly in internal assessment marks.',
          ],
          actionItems: [
            {
              text: 'Submit GitHub username and activate AWS Academy invite link',
              deadline: '25 Sept 2026, 11:59 PM',
              isUrgent: true,
              linkOrVenue: 'https://mca.campus.edu/cloud-lab',
            },
          ],
          deadlines: [
            {
              date: '2026-09-25',
              time: '23:59 IST',
              description: 'AWS sandbox onboarding submission',
              isStrictCutoff: true,
            },
          ],
          targetAudience: ['MCA 1st & 2nd Year Students'],
          feesAndFines: {
            hasFee: false,
          },
          contactPerson: {
            name: 'Prof. Meera Sen',
            office: 'MCA Computing Center Lab 4',
            emailOrPhone: 'mca-coordinator@campus.edu',
          },
        },
        {
          id: 'notice-mtech-research-fellowship',
          title: 'M.Tech: Thesis Synopsis & AICTE Research Fellowship Review',
          officialTitle: 'Directive MTECH/RES/2026-02: Biannual Research Progress Presentation and Scholarship Disbursement',
          department: 'Postgraduate & Research Deanery',
          referenceNumber: 'MTECH/RES/2026-02',
          issueDate: '15 Sept 2026',
          category: 'Scholarships & Aid',
          importance: 'CRITICAL',
          relevantDepartments: ['MTECH'],
          whyItMatters: 'Failure to submit verified dissertation synopsis stops your monthly AICTE PG scholarship (₹12,400/mo).',
          oneLineTLDR: 'All GATE-qualified M.Tech scholars must submit guide-signed research reviews by Sept 29 to clear monthly stipend.',
          bulletPoints: [
            'Requires thesis supervisor signature on quarterly progress milestone tracker.',
            'Turnitin plagiarism report below 10% similarity index required.',
            'Direct bank transfer of stipend cleared upon Departmental Research Committee (DRC) signoff.',
          ],
          actionItems: [
            {
              text: 'Submit 5-page dissertation progress report with Guide approval',
              deadline: '29 Sept 2026, 5:00 PM',
              isUrgent: true,
              linkOrVenue: 'Dean Research Office (Admin 3rd Floor)',
            },
          ],
          deadlines: [
            {
              date: '2026-09-29',
              time: '17:00 IST',
              description: 'M.Tech fellowship progress dossier cutoff',
              isStrictCutoff: true,
              penaltyIfMissed: 'October scholarship disbursement withheld',
            },
          ],
          targetAudience: ['M.Tech 2nd Year Postgraduate Scholars'],
          feesAndFines: {
            hasFee: false,
          },
          contactPerson: {
            name: 'Dean of Research & PG Studies',
            office: 'Admin 301',
            emailOrPhone: 'pg-research@campus.edu',
          },
        },
      ],
    },
  },
  {
    id: 'single-exam-circular',
    name: 'Official Circular: Semester Examination & Attendance Rules',
    badge: 'College-Wide Circular',
    description: 'A formal circular from the Dean of Academic Affairs regarding 75% attendance rules and exam fee cutoff.',
    imageUrl: 'https://images.unsplash.com/photo-1586281380349-632531db7ed4?auto=format&fit=crop&w=1200&q=80',
    simulatedData: {
      boardTitle: 'Academic Circular REF: DAA/2026/SEM-AUTUMN-CIR-14',
      scanTimestamp: '2026-09-18T10:15:00Z',
      totalNoticesFound: 1,
      criticalCount: 1,
      highCount: 0,
      executiveSummary: 'Detailed examination directive enforcing 75% minimum attendance and Sept 22 fee deadline. Students with 65-74% attendance must submit medical condonation before Sept 26.',
      urgentBroadcastMessage: `⚠️ *OFFICIAL CIRCULAR DIGEST: AUTUMN EXAM PROTOCOLS*

1️⃣ *Exam Fee Deadline*: Sept 22, 2026 (5 PM). Unpaid forms cancelled without notice.
2️⃣ *Attendance Requirement*: Strict 75% cutoff. Condonation for 65-74% only with hospital records submitted by Sept 26.
3️⃣ *Hall Ticket Release*: Available Oct 05 on ERP.`,
      notices: [
        {
          id: 'notice-exam-regulations-full',
          title: 'Autumn 2026 Examination Directives & Attendance Condonation',
          officialTitle: 'CIRCULAR: Academic Regulation Mandate for Autumn Semester 2026 Examinations',
          department: 'Dean of Academic Affairs',
          referenceNumber: 'DAA/2026/SEM-AUTUMN-CIR-14',
          issueDate: '15 Sept 2026',
          category: 'Exams & Fees',
          importance: 'CRITICAL',
          relevantDepartments: ['ALL'],
          whyItMatters: 'Strict 75% attendance required. If you are below 75% without authorized medical condonation by Sept 26, you cannot write exams.',
          oneLineTLDR: 'Pay exam fee by Sept 22 and submit attendance medical condonation before Sept 26.',
          bulletPoints: [
            'Mandatory 75% attendance is required in each theory and laboratory course.',
            'Condonation window: 65% to 74.9% eligible with Dean waiver and doctor certificate.',
            'Regular exam fee: ₹2,400 due by Sept 22 (5:00 PM).',
            'Hall tickets will be released Oct 05 on the Student Portal.',
          ],
          actionItems: [
            {
              text: 'Check attendance on Student Portal under Academic Audit',
              isUrgent: true,
            },
            {
              text: 'Pay Regular Exam Fee of ₹2,400 on ERP',
              deadline: '22 Sept 2026, 5:00 PM',
              isUrgent: true,
              feeAmount: '₹2,400',
            },
          ],
          deadlines: [
            {
              date: '2026-09-22',
              time: '17:00 IST',
              description: 'Regular exam fee remittance on ERP',
              isStrictCutoff: true,
            },
            {
              date: '2026-09-26',
              time: '16:00 IST',
              description: 'Attendance condonation document submission',
              isStrictCutoff: true,
            },
          ],
          targetAudience: ['All Students (All Branches)'],
          feesAndFines: {
            hasFee: true,
            amount: '₹2,400',
            lateFine: '₹500',
            paymentMode: 'ERP online portal',
          },
          contactPerson: {
            name: 'Prof. K. S. Mukherjee',
            office: 'Admin Block Room 210',
            emailOrPhone: 'dean-academic@campus.edu',
          },
        },
      ],
    },
  },
];
