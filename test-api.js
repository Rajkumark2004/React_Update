const fs = require('fs');
fetch('https://newlayout.wisibles.com/api_admin/admin/subjectgroup/')
  .then(res => res.json())
  .then(data => {
      console.log(JSON.stringify(data.data[0], null, 2));
  });
