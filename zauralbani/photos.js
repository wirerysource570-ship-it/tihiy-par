const viewer = document.querySelector('#work-view');
document.querySelectorAll('.work-photo').forEach(button => {
  button.addEventListener('click', () => {
    const image = button.querySelector('img');
    viewer.querySelector('img').src = image.src;
    viewer.querySelector('img').alt = image.alt;
    viewer.querySelector('figcaption').textContent = button.parentElement.querySelector('figcaption').textContent;
    viewer.showModal();
  });
});
viewer.querySelector('button').addEventListener('click', () => viewer.close());
viewer.addEventListener('click', event => { if (event.target === viewer) viewer.close(); });
