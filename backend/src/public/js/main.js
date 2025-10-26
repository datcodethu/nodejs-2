document.addEventListener('DOMContentLoaded', () => {
  const uploadBtn = document.getElementById('upload-btn');
  const newFolderBtn = document.getElementById('new-folder-btn');

  if (uploadBtn) {
    uploadBtn.addEventListener('click', () => {
      alert('Open upload modal (to implement)');
    });
  }

  if (newFolderBtn) {
    newFolderBtn.addEventListener('click', () => {
      const folderName = prompt('Enter folder name:');
      if(folderName) {
        alert('Create folder: ' + folderName + ' (to implement API call)');
      }
    });
  }
});
