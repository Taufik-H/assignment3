async function getData(url = "") {
  const response = await fetch(url, { method: "GET" });
  return await response.json();
}

async function displayData() {
  const data = await getData("/items");
  data.forEach((movie) => {
    const imageUrl = movie.cover ? `/uploads/${movie.cover}` : "";

    const card = `
      <div class="col-lg-3 col-md-6 col-sm-6">
          <div class="product__item">
          <div class="product__item__pic set-bg" style="background-image:url('${imageUrl}'); width:250px;object-fit:cover;">
                  <div class="p-2">
                      <button type="button" class="btn btn-warning mr-3" data-toggle="modal" data-target="#modal-edit" onclick="editData('${movie.id}')">Edit</button>
                      <button type="button" class="btn btn-danger" onclick="removeData('${movie.id}')">Remove</button>
                  </div>
                 
                  <div class="view">Status : ${movie.status}</div>
              </div>
              <div class="product__item__text">
                  <ul style="display:flex;gap:4px;"></ul>
                  <h5>
                      <a data-toggle="modal" data-target="#modal" href="#" onclick="getDetail('${movie.id}')" id="title">${movie.title}</a>
                  </h5>
              </div>
          </div>
      </div>`;

    const listMovie = document.querySelector("#list-movie");
    listMovie.innerHTML += card;
  });
}
displayData();

async function getDetail(id) {
  const movie = await getData(`/items/${id}`);
  document.getElementById("modal-title").textContent = movie.title;
  document.getElementById("modal-image").src = `/uploads/${movie.cover}`;
  document.getElementById("modal-episodes").textContent = movie.episodes;
  document.getElementById("modal-ranking").textContent = movie.ranking;
  document.getElementById("modal-status").textContent = movie.status;
  document.getElementById("modal-genres").textContent = movie.genres;
  document.getElementById("modal-synopsis").textContent = movie.description;
}

// 3. Create
async function postData(url = "", data = {}) {
  const response = await fetch(url, {
    method: "POST",
    body: data,
  });

  if (!response.ok) throw new Error("Failed to post data.");

  return await response.json();
}

document.querySelector("form").addEventListener("submit", async (e) => {
  e.preventDefault();
  const formData = new FormData(e.target);
  const data = await postData("/items", formData);
  console.log(data);
  location.reload();
});

async function editData(id) {
  const data = await getData(`/items/${id}`);
  document.getElementById("title").value = data.title;
  document.getElementById("genres").value = data.genres;
  document.getElementById("episodes").value = data.episodes;
  document.getElementById("synopsis").value = data.description;
  document.getElementById("status-edit").value = data.status;

  const coverInput = document.getElementById("cover");
  const existingPreview = document.querySelector(".cover-preview");
  if (existingPreview) {
    existingPreview.remove();
  }
  const imageUrl = data.cover ? `/uploads/${data.cover}` : null;

  const previewImage = document.createElement("img");
  previewImage.src = imageUrl;
  previewImage.src = `/uploads/${data.cover}`;
  previewImage.style.width = "100%";
  previewImage.style.marginTop = "10px";
  previewImage.classList.add("cover-preview");
  coverInput.insertAdjacentElement("afterend", previewImage);

  const btnSave = document.querySelector(".btn-save");
  btnSave.onclick = function (e) {
    e.preventDefault();
    updateDataWithForm(
      `/items/${id}`,
      document.querySelector("#modal-edit form")
    )
      .then((res) => {
        console.log(res);
        location.reload();
      })
      .catch((err) => {
        console.error("Failed to update:", err);
      });
  };
}

async function updateDataWithForm(url = "", formElement) {
  const formData = new FormData(formElement);

  if (formElement.querySelector("#cover").files.length > 0) {
    const response = await fetch(url, {
      method: "PUT",
      body: formData,
    });

    if (!response.ok) {
      throw new Error(`Failed to update data. Status code: ${response.status}`);
    }

    return await response.json();
  } else {
    const data = {};
    formData.forEach((value, key) => {
      if (key !== "cover") {
        data[key] = value;
      }
    });

    const response = await fetch(url, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error(`Failed to update data. Status code: ${response.status}`);
    }

    return await response.json();
  }
}

async function deleteData(url = "") {
  const response = await fetch(url, {
    method: "DELETE",
  });
  return await response.status;
}

async function removeData(id) {
  const status = await deleteData(`/items/${id}`);
  if (status === 200) {
    alert("Data successfully deleted");
    location.reload();
  } else {
    alert(`Error deleting data. Status code: ${status}`);
  }
}
