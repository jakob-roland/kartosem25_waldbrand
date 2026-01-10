const image1 = document.getElementById("image1");
const image2 = document.getElementById("image2");
const handle = document.getElementById("handle");
const wrapper_left = document.getElementById("wrapper_left");
const container = document.getElementById("comparison-container");
const burnt_area = document.getElementById("burnt_area_text");
// real world width of the elements in meters (changed so it fits the size_text.png image, not a clean solution :/). elisoidal measurents are used. EPSG:3857
const sizes_dict = {
  'sat' : 168861, /* 168861 */
  'vienna': 34000, 
  'liechtenstein': 13000,
  'attersee': 9500,
  'athen': 10500, 
  'scalebar': 30000 
  /* 'neusiedlerSee': 14500 */
}

// #region functions and eventlisteners on document and window
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

  // update burnt_area_text in sizeComparison
  if (time_left == "2023-08-03" || time_right == "2023-08-03") {
    burnt_area.innerHTML = "Verbrannte Fläche: 0 km²"
  }
  if (time_left == "2023-08-23" || time_right == "2023-08-23") {
    burnt_area.innerHTML = "Verbrannte Fläche: 735,27 km²"
  }
  if (time_left == "2023-09-12" || time_right == "2023-09-12") {
    burnt_area.innerHTML = "Verbrannte Fläche: 938,81 km²"
  }

  updateOverlay()
  // for testing
/*   image1.src = 'data/size_test.png';
  image2.src = 'data/size_test.png'; */
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
          new_overlay.style.zIndex = 2;
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

// get map scale in 1 px : x meters. Based on the satellite images in full resolution (2500px : 168 861m)
function getPixelScale() {  
    // 1. Get dimensions
    const containerWidth = image2.clientWidth;
    const containerHeight = image2.clientHeight;
    const naturalWidth = image2.naturalWidth;
    const naturalHeight = image2.naturalHeight;

    // 2. Calculate the zoom/scale factor used by 'object-fit: cover'
    const scaleWidth = containerWidth / naturalWidth;
    const scaleHeight = containerHeight / naturalHeight;
    
    // 'cover' uses the LARGER of the two scales to ensure the area is filled
    const currentZoomFactor = Math.max(scaleWidth, scaleHeight);

    // 3. Calculate the actual width of the image (including the cropped parts)
    const renderedWidthPx = naturalWidth * currentZoomFactor;

    // 4. Calculate Pixel Scale (1px = X meters)
    const metersPerPixel = sizes_dict['sat'] / naturalWidth; // Base resolution
    const currentMetersPerPixel = sizes_dict['sat'] / renderedWidthPx;

    console.log(`Current Pixel Scale: 1px = ${currentMetersPerPixel.toFixed(2)} meters`);
    return currentMetersPerPixel;
}

// resizes comparison shapes and scalebar according to window pixel scale
function resizeElements() {
  scale = getPixelScale();
  const SC_shapes = document.querySelectorAll('.SC_shape');
  const scalebar_bars = document.getElementById('scalebar_bars');
  const scalebar_labels = document.getElementById('scalebar_labels');

  scalebar_bars.style.width = `${sizes_dict['scalebar']/scale}px`;
  scalebar_labels.style.width = `${sizes_dict['scalebar']/scale+100}px`;

  SC_shapes.forEach((shape) => {
    let shape_name = shape.id.split('_')[0];
    shape.style.width = `${sizes_dict[shape_name]/scale}px`;
  })

  return scale;
}

// if the viewport is small, sections in panel_left are collapsed
function adjustToScreenHeight() {
  let height = window.innerHeight;
  if (height < 804) {
    let section = document.getElementById(`section_SC`)
    let triangle = document.getElementById(`triangle_SC`);
    triangle.style.rotate = "-90deg";
    section.style.display = 'none';

    section = document.getElementById(`section_IM`)
    triangle = document.getElementById(`triangle_IM`);
    triangle.style.rotate = "-90deg";
    section.style.display = 'none';
  }
}


adjustToScreenHeight();
document.addEventListener('DOMContentLoaded', () => {updateImages()});
let scale;
document.addEventListener('DOMContentLoaded', () => {
  scale = resizeElements();  
});
window.addEventListener('resize', () => {scale = resizeElements()});


// #endregion

// #region COMPARISON HANDLE
let isDragging = false;
let isDragging_SC = null;

// 1. When the user clicks down, start dragging
container.addEventListener('mousedown', () => {
  if (!checkEqual()) {
    isDragging = true;
  }
});

// 2. When the user releases the click, stop dragging
window.addEventListener('mouseup', () => {
  isDragging = false; // for the comparison handle
  isDragging_SC = null; // for the size comparison shapes
});

// 3. Track the mouse movement
window.addEventListener('mousemove', (e) => {
  // if neither the comparison handle or a size comparison shape is being dragged
  if (!isDragging && !isDragging_SC) {
    container.style.cursor = 'auto';
    return;
  };

  // Dragging of the comparison handle
  if (isDragging) {
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
  
  // Dragging of a comparison shape
  } else if (isDragging_SC) {
    let SC_shape = document.getElementById(isDragging_SC);
    SC_shape.style.left = e.clientX + 'px';
    SC_shape.style.top = e.clientY + 'px';
  }
});

// #region TOUCH SUPPORT

// 1. Touch Start
container.addEventListener('touchstart', (e) => {
  if (!checkEqual()) {
    isDragging = true;
    // Prevent scrolling when interacting with the slider
    e.preventDefault(); 
  }
}, { passive: false });

// 2. Touch End
window.addEventListener('touchend', () => {
  isDragging = false;
  isDragging_SC = null;
});

// 3. Touch Move
window.addEventListener('touchmove', (e) => {
  if (!isDragging && !isDragging_SC) return;

  // Use the first finger touch
  const touch = e.touches[0];

  if (isDragging) {
    const rect = container.getBoundingClientRect();
    let x = touch.clientX - rect.left;

    if (x < 0) x = 0;
    if (x > rect.width) x = rect.width;

    const percentage = (x / rect.width) * 100;

    wrapper_left.style.width = `${percentage}%`;
    handle.style.left = `${percentage}%`;
    
    // Prevent page bounce/scroll while dragging
    e.preventDefault(); 
  } else if (isDragging_SC) {
    let SC_shape = document.getElementById(isDragging_SC);
    SC_shape.style.left = touch.clientX + 'px';
    SC_shape.style.top = touch.clientY + 'px';
    e.preventDefault();
  }
}, { passive: false });

// #endregion

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

// #region OVERLAY DATA

const checkboxes_overlayData_left = document.querySelectorAll('input[name="overlay_data_left"]');
checkboxes_overlayData_left.forEach(checkbox => {
  checkbox.addEventListener('change', () => {updateOverlay()})})

const checkboxes_overlayData_right = document.querySelectorAll('input[name="overlay_data_right"]');
checkboxes_overlayData_right.forEach(checkbox => {
  checkbox.addEventListener('change', () => {updateOverlay()})})
      
// #endregion

// #region SIZE COMPARISON (SC)
const SC_buttons = document.querySelectorAll('button[name="SC_buttons"]')
let SC_shape_count = 0;


SC_buttons.forEach(button => {
  button.addEventListener('mousedown', (e) => {
    let SC_button_image = document.getElementById(`SC_button_image_${button.value}`);

    // only left click activates the function
    if (e.button !== 0) return;
    SC_shape_count ++;

    // checks if scale is null
    if (!scale) {
      console.log("scale is null. Recalculating scale")
      scale = resizeElements();
    }

    // shape creation
    let SC_shape = document.createElement("img");
    SC_shape.classList.add("SC_shape");
    SC_shape.src = `data/${button.value}.png`;
    SC_shape.id = `${button.value}_${SC_shape_count}`;
    SC_shape.draggable = false;
    // the shape gets the same color as the image in the button
    SC_shape.style.filter = SC_button_image.style.filter
    SC_shape.style.left = e.clientX + 'px';
    SC_shape.style.top = e.clientY + 'px';

    SC_shape.style.width = `${sizes_dict[button.value]/scale}px` 

    // make the shape draggeable immediately
    isDragging_SC = SC_shape.id;

    document.body.appendChild(SC_shape);

    // changes the color of the image in the button randomly (between 20 and 340)
    let deg = Math.floor(Math.random() * 340 + 20)
    SC_button_image.style.filter = `hue-rotate(${deg}deg)`

    // right click removes the shape
    SC_shape.addEventListener('contextmenu', (e) => {
      e.preventDefault(); // stop browser context menu
      SC_shape.remove();
      SC_shape_count --;
    });

    // for dragging
    SC_shape.addEventListener('mousedown', (e) => {
      // only left click activates the function
      if (e.button !== 0) return;
      isDragging_SC = SC_shape.id;
    })
    // for touch screen
    SC_shape.addEventListener('touchstart', (e) => {
      // Set the ID to track which specific shape is being dragged
      isDragging_SC = SC_shape.id;
  
      // Prevent the screen from scrolling or zooming while moving the shape
     if (e.cancelable) e.preventDefault();
    }, { passive: false });
  })})

// #endregion

// #region COLLAPSE SECTIONS
function collapseSection(name, close) {
  let section = document.getElementById(`section_${name}`)
  let triangle = document.getElementById(`triangle_${name}`);
  let rotation = triangle.style.rotate;

  // if close is true the section only closes, but doesnt open if already closed
  if (close) {
    triangle.style.rotate = "-90deg";
    section.style.display = 'none';
    return;
  }

  // -90deg means the section is closed 0deg means it is open
  if (rotation === "-90deg") {
    triangle.style.rotate = "0deg";
    section.style.display = 'block';
  } else {
    triangle.style.rotate = "-90deg";
    section.style.display = 'none';
  }
}

triangle_CC.addEventListener("click", () => {collapseSection("CC", false)});
triangle_IM.addEventListener("click", () => {collapseSection("IM", false)});
triangle_SC.addEventListener("click", () => {collapseSection("SC", false)});

// Collapse panel left
triangle_main.addEventListener("click", () => {
  let panel_left = document.getElementById("panel-left");
  let triangle = document.getElementById("triangle_main");
  let rotation = triangle.style.rotate;
  console.log(rotation);

    // 180 deg means the section is closed 0deg means it is open
  if (rotation === "180deg") {
    triangle.style.rotate = "0deg";
    panel_left.style.transform = "translateX(0px)";
  } else {
    collapseSection("CC", true);
    collapseSection("IM", true);
    collapseSection("SC", true);

    triangle.style.rotate = "180deg";
    panel_left.style.transform = "translateX(-380px)";
  }
})

// #endregion
