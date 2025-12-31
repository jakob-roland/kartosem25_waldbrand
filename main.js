const image1 = document.getElementById("image1");
const image2 = document.getElementById("image2");
const handle = document.getElementById("handle");
const wrapper_left = document.getElementById('wrapper_left');
const container = document.getElementById('comparison-container');

function updateImages() {
  let time_left = document.querySelector('input[name="radio_time_left"]:checked')?.value;
  let time_right = document.querySelector('input[name="radio_time_right"]:checked')?.value;

  let base_left = document.querySelector('input[name="radio_base_left"]:checked')?.value;
  let base_right = document.querySelector('input[name="radio_base_right"]:checked')?.value;

  let img_mode = document.querySelector('input[name="img_mode"]:checked')?.value;

  if (base_left == 'OSM') {
    image1.src = `data/osm.png`;
  } else {
    image1.src = `data/${time_left}_${img_mode}.png`;
  };

  if (base_right == 'OSM') {
    image2.src = `data/osm.png`;
  } else {
    image2.src = `data/${time_right}_${img_mode}.png`;
  };

  updateOverlay()
};

function updateOverlay() {
  let time_left = document.querySelector('input[name="radio_time_left"]:checked')?.value;
  let time_right = document.querySelector('input[name="radio_time_right"]:checked')?.value;

  let checkedBoxesLeft = document.querySelectorAll('input[name="overlay_data_left"]:checked');
  let checkedBoxesRight = document.querySelectorAll('input[name="overlay_data_right"]:checked');
  let valuesLeft = Array.from(checkedBoxesLeft).map(cb => cb.value);
  let valuesRight = Array.from(checkedBoxesRight).map(cb => cb.value);

  // remove old overlays
  document.querySelectorAll('.overlay_image').forEach(el => el.remove());

  if (time_left != "2023-08-03"){
    for (let i = 0; i < valuesLeft.length; i++) {
      if (valuesLeft[i] == 'active_fires' && time_left == "2023-09-12"){continue}
      else {
        let new_overlay = document.createElement("img");
        new_overlay.src = `data/${time_left}_${valuesLeft[i]}.png`;
        new_overlay.classList.add("comparison_image");
        new_overlay.classList.add("overlay_image");
        if (valuesLeft[i] == 'active_fires'){
          new_overlay.style.zIndex = 1
        }

        let containerOverlay = document.getElementById(`wrapper_left`)
        containerOverlay.append(new_overlay);
    }}}

  if (time_right != "2023-08-03"){
    for (let i = 0; i < valuesRight.length; i++) {
      if (valuesRight[i] == 'active_fires' && time_right == "2023-09-12"){continue}
      else {
        let new_overlay = document.createElement("img");
        new_overlay.src = `data/${time_right}_${valuesRight[i]}.png`;
        new_overlay.classList.add("comparison_image");
        new_overlay.classList.add("overlay_image");
        if (valuesRight[i] == 'active_fires'){
          new_overlay.style.zIndex = 1
        }

        let containerOverlay = document.getElementById(`wrapper_right`)
        containerOverlay.append(new_overlay);
  }}}

  if ((checkEqual())) {
    handle.style.opacity = 0
  } else {
    handle.style.opacity = 1
  }
  /* image1.src = "data/size_test.png" */ // REMOVE
}

// checks if the left and right canvas have the same image and overlay
function checkEqual() {
  let checkedBoxesLeft = document.querySelectorAll('input[name="overlay_data_left"]:checked');
  let checkedBoxesRight = document.querySelectorAll('input[name="overlay_data_right"]:checked');
  let valuesLeft = Array.from(checkedBoxesLeft).map(cb => cb.value);
  let valuesRight = Array.from(checkedBoxesRight).map(cb => cb.value);

  const isEqual = valuesLeft.length === valuesRight.length && 
                  valuesLeft.every((val, index) => val === valuesRight[index]);

  if (image1.src == image2.src && isEqual) {
    return true
  } else {return false}
}

document.addEventListener('DOMContentLoaded', () => {updateImages()});

// #region COMPARISON HANDLE
let isDragging = false;

// 1. When the user clicks down, start dragging
container.addEventListener('mousedown', () => {
  if (!checkEqual()) {
    isDragging = true;
  }
});

// 2. When the user releases the click, stop dragging
window.addEventListener('mouseup', () => {
  isDragging = false;
});

// 3. Track the mouse movement
window.addEventListener('mousemove', (e) => {
  if (!isDragging) {
    container.style.cursor = 'auto';
    return;
  };

  // Get the bounding box of the container to handle offsets
  const rect = container.getBoundingClientRect();
  
  // Calculate the horizontal position of the mouse relative to the container
  let x = e.clientX - rect.left;

  // Constrain the 'x' value so the border doesn't go off-screen
  if (x < 0) x = 0;
  if (x > rect.width) x = rect.width;

  // Calculate the percentage
  const percentage = (x / rect.width) * 100;

  // Update the CSS width of the wrapper
  wrapper_left.style.width = `${percentage}%`;
  handle.style.left = `${percentage}%`;
  container.style.cursor = 'col-resize';
});
// #endregion

// #region RADIO BUTTONS EVENT LISTENERS

// Time Radio Buttons
const radio_time_left = document.querySelectorAll('input[name="radio_time_left"]');
radio_time_left.forEach(radio => {
  radio.addEventListener('change', () => {updateImages()})
});
const radio_time_right = document.querySelectorAll('input[name="radio_time_right"]');
radio_time_right.forEach(radio => {
  radio.addEventListener('change', () => {updateImages()})
});

// Base Radio Buttons
const radio_base_left = document.querySelectorAll('input[name="radio_base_left"]');
radio_base_left.forEach(radio => {
  radio.addEventListener('change', () => {updateImages()})
});
const radio_base_right = document.querySelectorAll('input[name="radio_base_right"]');
radio_base_right.forEach(radio => {
  radio.addEventListener('change', () => {updateImages()})
});

// Mode Radio Buttons
const radio_Imagemode = document.querySelectorAll('input[name="img_mode"]');
radio_Imagemode.forEach(radio => {
  radio.addEventListener('change', () => {updateImages()})
});


// #endregion

// #region OVERLAY IMAGES

const checkboxes_overlayData_left = document.querySelectorAll('input[name="overlay_data_left"]');
checkboxes_overlayData_left.forEach(checkbox => {
  checkbox.addEventListener('change', () => {updateOverlay()})})

const checkboxes_overlayData_right = document.querySelectorAll('input[name="overlay_data_right"]');
checkboxes_overlayData_right.forEach(checkbox => {
  checkbox.addEventListener('change', () => {updateOverlay()})})
      
// #endregion

// #region SIZE COMPARISON

/* const checkbox_vienna = document.getElementById("checkbox_vienna") */



/* image1.onload = function() {
  let viewport_factor = Number(image1.width) / Number(image1.naturalWidth);
  let scale_factor = Number(67.54);
  console.log(`Viewport Factor: ${viewport_factor}`)
  console.log(`Scale Factor: 1px = ${scale_factor}`)

  let new_sizeImage = document.createElement("img");
  new_sizeImage.classList.add("sizeComparison_image");
  new_sizeImage.id = "Vienna";
  new_sizeImage.src = "data/vienna.png";
  new_sizeImage.width = "113px"
  container.append(new_sizeImage);
} */


// #endregion