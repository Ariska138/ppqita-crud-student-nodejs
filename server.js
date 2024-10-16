const http = require('http');
const fs = require('fs');
const path = require('path');

let students = [
  { id: 1, name: 'Ali', age: 16, class: '10A' },
  { id: 2, name: 'Aisha', age: 15, class: '10B' },
];

const server = http.createServer((req, res) => {
  const { method, url } = req;

  // Melayani file statis dari folder public
  if (
    url === '/' ||
    url.endsWith('.html') ||
    url.endsWith('.js') ||
    url.endsWith('.css')
  ) {
    const filePath = url === '/' ? '/index.html' : url;
    const fullPath = path.join(__dirname, 'public', filePath);

    fs.readFile(fullPath, (err, data) => {
      if (err) {
        res.writeHead(404, { 'Content-Type': 'text/plain' });
        res.end('File not found');
        return;
      }

      res.writeHead(200, { 'Content-Type': getContentType(fullPath) });
      res.end(data);
    });
    return;
  }

  // API CRUD
  if (url === '/students' && method === 'GET') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(students));
  }

  if (url === '/students' && method === 'POST') {
    let body = '';
    req.on('data', (chunk) => {
      body += chunk.toString();
    });
    req.on('end', () => {
      const newStudent = JSON.parse(body);
      newStudent.id = students.length + 1;
      students.push(newStudent);
      res.writeHead(201, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify(newStudent));
    });
  }

  if (url.startsWith('/students/') && method === 'PUT') {
    const id = parseInt(url.split('/')[2]);
    let body = '';
    req.on('data', (chunk) => {
      body += chunk.toString();
    });
    req.on('end', () => {
      const updatedStudent = JSON.parse(body);
      const index = students.findIndex((student) => student.id === id);
      if (index !== -1) {
        students[index] = { id, ...updatedStudent };
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(students[index]));
      } else {
        res.writeHead(404, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ message: 'Student not found' }));
      }
    });
  }

  if (url.startsWith('/students/') && method === 'DELETE') {
    const id = parseInt(url.split('/')[2]);
    const index = students.findIndex((student) => student.id === id);
    if (index !== -1) {
      students.splice(index, 1);
      res.writeHead(204); // No content
      res.end();
    } else {
      res.writeHead(404, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ message: 'Student not found' }));
    }
  }
});

function getContentType(filePath) {
  if (filePath.endsWith('.html')) return 'text/html';
  if (filePath.endsWith('.js')) return 'application/javascript';
  if (filePath.endsWith('.css')) return 'text/css';
  return 'text/plain';
}

server.listen(3000, () => {
  console.log('Server running at http://localhost:3000/');
});
