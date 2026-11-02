import { COURSE_DATE, COURSE_TIME, DEFAULT_FEE, DEFAULT_SEATS, RECORDED_FEE } from './config'

import business from './assets/dept-business.jpg'
import software from './assets/dept-software.jpg'
import arts from './assets/dept-arts.jpg'
import eng from './assets/dept-eng.jpg'

import syndicate from './assets/partner-syndicate.jpg'
import creativa from './assets/partner-creativa.jpg'
import itida from './assets/partner-itida.jpg'
import aiet from './assets/partner-aiet.jpg'
import northwest from './assets/partner-northwest.jpg'

import naggar from './assets/inst-naggar.jpg'
import mirna from './assets/inst-mirna.jpg'
import abdelrahman from './assets/inst-abdelrahman.jpg'
import osman from './assets/inst-osman.jpg'
import latif from './assets/inst-latif.jpg'
import nada from './assets/inst-nada.jpg'
import tasneem from './assets/inst-tasneem.jpg'

import s1 from './assets/session-1.jpg'
import s2 from './assets/session-2.jpg'
import s3 from './assets/session-3.jpg'
import s4 from './assets/session-4.jpg'

export const SESSIONS = [s1, s2, s3, s4]

export const DEPT = {
  business: {
    name: 'Business', short: 'Business', tag: 'Green Department', c: 'var(--green)', img: business,
    blurb: 'Frameworks, tools and decision-making for people who run projects, teams and growth.',
    tracks: ['Project Management', 'Business Analysis', 'Data Analytics', 'Digital Marketing', 'Human Resources', 'Entrepreneurship', 'Sales & Business Development', 'Operations & Supply Chain', 'Leadership & Management', 'Workplace Excellence'],
  },
  software: {
    name: 'Software & Technology', short: 'Software', tag: 'Blue Department', c: 'var(--blue)', img: software,
    blurb: 'Build, test, secure and ship software, from the first line of code to the cloud.',
    tracks: ['Software Development', 'Software Testing', 'Cybersecurity', 'Artificial Intelligence & Machine Learning', 'Big Data & Data Engineering', 'Data Science', 'Power Apps', 'Cloud & DevOps', 'Front-End Development', 'Mobile Development', 'Database Development'],
  },
  arts: {
    name: 'Digital Arts', short: 'Digital Arts', tag: 'Red Department', c: 'var(--red)', img: arts,
    blurb: 'Design, motion and visual storytelling, practised on real briefs.',
    tracks: ['Graphic Design', 'UI/UX Design', 'Motion Graphics', 'Video Editing', '3D Design & Animation', 'Branding & Visual Identity', 'Content Creation'],
  },
  eng: {
    name: 'Engineering', short: 'Engineering', tag: 'Yellow Department', c: 'var(--yellow)', img: eng,
    blurb: 'From CAD and automation to embedded systems and robotics, learned through hands-on projects.',
    tracks: ['Mechanical Design', 'Reverse Engineering', 'CAD/CAM', 'Industrial Automation', 'Embedded Systems', 'Robotics', 'Manufacturing Engineering', 'Quality & Industrial Engineering'],
  },
}

// Course details. Anything not listed here shows TBA for hours and instructor.
const COURSES = {
  'Big Data & Data Engineering': { hours: 60, inst: 'Eng. Abd Elrahman Khalifa' },
  'Software Testing': { hours: 100, inst: 'Eng. Mirna Hatem' },
  'Front-End Development': { hours: 120, fee: 5000 },
  'Artificial Intelligence & Machine Learning': { hours: 140, fee: 5000, inst: 'Eng. Mohamed Lotfy' },
  'Data Science': { hours: 80, inst: 'Eng. Mohamed El Naggar' },
  'Power Apps': { hours: 48, inst: 'Eng. Akmal Elearky' },
  'Cloud & DevOps': { inst: 'Eng. Tasneem Sherif' },
  'Project Management': { inst: 'Eng. Mohamed Osman' },
  'Graphic Design': { inst: 'Eng. Nada Youssef' },
  'Mechanical Design': { inst: 'Eng. Abd Ellatif' },
  'Workplace Excellence': { hours: 20, fee: 2000 },
}

const egp = (n) => n.toLocaleString('en-US') + ' EGP'

export function courseFields(title, mode) {
  const c = COURSES[title] || {}
  const hours = c.hours ? c.hours + ' hours' : 'TBA'
  const inst = c.inst || 'TBA'
  if (mode === 'live') {
    return [['Start date', COURSE_DATE], ['Schedule', COURSE_TIME], ['Total hours', hours], ['Instructor', inst], ['Seats', String(DEFAULT_SEATS)], ['Fee', egp(c.fee || DEFAULT_FEE)]]
  }
  return [['Lessons', 'TBA'], ['Total hours', hours], ['Access', 'After payment'], ['Instructor', inst], ['Fee', egp(RECORDED_FEE)]]
}

export const PARTNERS = {
  SYND: { name: 'Alexandria Engineering Syndicate', alt: 'Alexandria Engineers Syndicate logo', img: syndicate },
  CREATIVA: { name: 'Creativa', alt: 'Creativa logo', img: creativa },
  ITIDA: { name: 'ITIDA', alt: 'ITIDA logo', img: itida },
  AIET: { name: 'AIET', alt: 'AIET logo', img: aiet },
  NW: { name: 'Northwest', alt: 'Northwest logo', img: northwest, dark: true },
}

export const INSTRUCTORS = [
  { name: 'Eng. Mohamed El Naggar', img: naggar, facts: ['10+ Years of Experience', 'Data Scientist and Data Engineer'] },
  { name: 'Eng. Mirna Hatem', img: mirna, facts: ['3+ Years of Experience', 'Software Tester - ISTQB Certified'] },
  { name: 'Eng. Abd Elrahman Khalifa', img: abdelrahman, facts: ['5+ Years of Experience', 'Data Team Lead and Data Analyst'] },
  { name: 'Eng. Mohamed Osman', img: osman, facts: ['7+ Years of Experience', 'Senior Project Manager'] },
  { name: 'Eng. Abd Ellatif', img: latif, facts: ['30+ Years of Experience', 'Mechanical & Die Design Engineer'] },
  { name: 'Eng. Nada Youssef', img: nada, facts: ['3+ Years of Experience', 'Senior Graphic Designer'] },
  { name: 'Eng. Tasneem Sherif', img: tasneem, facts: ['4+ Years of Experience', 'DevOps Engineer - AWS Certified'] },
]

export const FACULTIES = ['Engineering', 'Computer Science & Information Technology', 'Business / Commerce', 'Fine Arts / Applied Arts', 'Science', 'Other']

// Globe destinations. s = label side: r (right, default), l, a (above), b (below)
export const CITIES = [
  { n: 'London', lat: 51.5, lon: -0.1, s: 'l' }, { n: 'Moscow', lat: 55.7, lon: 37.6, s: 'a' }, { n: 'Saudi Arabia', lat: 24.7, lon: 46.7, s: 'b' }, { n: 'Emirates', lat: 24.5, lon: 54.4, s: 'a' },
  { n: 'Lagos', lat: 6.5, lon: 3.4, s: 'l' }, { n: 'Johannesburg', lat: -26.2, lon: 28 }, { n: 'Mumbai', lat: 19.1, lon: 72.9 }, { n: 'Singapore', lat: 1.35, lon: 103.8 },
  { n: 'Shanghai', lat: 31.2, lon: 121.5 }, { n: 'Tokyo', lat: 35.7, lon: 139.7 }, { n: 'Sydney', lat: -33.9, lon: 151.2 },
  { n: 'Canada', lat: 53, lon: -100, s: 'a' }, { n: 'America', lat: 39, lon: -98, s: 'b' }, { n: 'Mexico City', lat: 19.4, lon: -99.1, s: 'b' },
  { n: 'São Paulo', lat: -23.5, lon: -46.6 }, { n: 'Buenos Aires', lat: -34.6, lon: -58.4, s: 'l' },
]
