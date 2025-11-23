const cl = console.log;


const postForm = document.getElementById("postForm")
const postTitleControl = document.getElementById("postTitle")
const postContentControl = document.getElementById("postContent")
const userIdControl = document.getElementById("userId")

const loader = document.getElementById("loader")
const AddpostBtn = document.getElementById("AddpostBtn")
const updatePostBtn = document.getElementById("updatePostBtn")

const postContainer = document.getElementById("postContainer")

const BASE_URL = "https://playerblog-default-rtdb.firebaseio.com";
const POST_URL = `${BASE_URL}/player.json`




function toggelSpineer(flag) {
    if (flag === true) {
        loader.classList.remove('d-none')
    } else {
        loader.classList.add('d-none')
    }
}
function snackbar(title, icon) {
    Swal.fire({
        title: title,
        icon: icon,
        timer: 1000,

    });
}

const createCards = arr => {
    let result = arr.map(post => {
        return `
            <div class="col-md-3 mb-4">
                <div class="card" id="${post.id}">
                    <div class="card-header">
                        <h3>${post.Title}</h3>
                    </div>
                    <div class="card-body">
                        <p>${post.content}</p>
                    </div>
                    <div class="card-footer d-flex justify-content-between">
                        <button class="btn btn-outline-primary btn-sm" onclick="onEdit(this)">Edit</button>
                        <button class="btn btn-outline-danger btn-sm removeBtn" onclick="onremove(this)">Remove</button>
                    </div>
                </div>
            </div>
        `;
    }).join('');

    postContainer.innerHTML = result;
};

const onremove = (ele) => {
    Swal.fire({
        title: "Do you want to Remove this blog",
        showCancelButton: true,
        confirmButtonColor: "#3085d6",
        cancelButtonColor: "#d33",
        confirmButtonText: "Yes, Remove it!"
    }).then((result) => {
        if (result.isConfirmed) {
            let REMOVE_ID = ele.closest('.card').id
            cl(REMOVE_ID)

            //remove URL

            const REMOVE_URL = `${BASE_URL}/player/${REMOVE_ID}.json`;

            //API CALL
            toggelSpineer(true)

            fetch(REMOVE_URL, {
                method: "DELETE",
                body: null,
                headers: {
                    Auth: "Token Form LS",
                    "content-type": "Application/json"
                }
            })
                .then(res => {
                    return res.json()
                })
                .then(data => {
                    cl(data)

                    //IF API CALL SUCCESS THEN REMOVE FROM UI
                    ele.closest('.card').remove();

                    snackbar(`The blog with id ${REMOVE_ID} is removed successfully!!!`, "success");


                })
                .catch(err => {
                    cl(err);
                    snackbar("Something went wrong while deleting!", "error");
                })

                .finally(() => {
                    toggelSpineer(false)
                })

        }


    })

}



let playerArr = []
function playerObjArr(resObj) {


    for (const key in resObj) {

        resObj[key].id = key
        playerArr.push(resObj[key])
    }
    return (playerArr)
}

function fetchBlogs() {
    toggelSpineer(true)

    fetch(POST_URL, {
        method: "GET",
        body: null,
        headers: {
            "Auth": "Token Form LS",
            "content-type": "Application/json"
        }
    })
        .then(res => {
            return res.json()
        })
        //convert obj into array
        .then(data => {
            cl(data)
            let playerArr = playerObjArr(data)
            createCards(playerArr)
        })
        .catch(cl)
        .finally(() => {
            toggelSpineer(false)
        })

}
fetchBlogs()


function onblogAdd(e) {
    e.preventDefault();


    const blogObj = {
        Title: postTitleControl.value,
        content: postContentControl.value,

    };
    toggelSpineer(true);

    fetch(POST_URL, {
        method: 'POST',
        body: JSON.stringify(blogObj),
        headers: {
            Auth: "Token Form LS",
            "content-type": "Application/json"
        }
    })
        .then(res => {
            if (res.status >= 200 && res.status < 300) {
                return res.json()
            }
        })
        .then(data => {
            cl(data)
            blogForm.reset()

            ///create single card on ui
            let card = document.createElement('div')
            card.className = 'card mb-5 shadow rounded'
            card.id = data.name;
            card.innerHTML = `<div class="card-header">
                        <h3>${blogObj.Title}<h3>
                    </div>
                    <div class="card-body">
                        <p>${blogObj.content}</p>
                    </div>
                    <div class="card-footer d-flex justify-content-between">
                        <button class="btn btn-outline-primary btn-sm" onclick = "onEdit(this)">Edit</button>
                        <button  class="btn btn-outline-danger btn-sm removebtn" onclick = "onremove(this)">Remove</button>
                    </div>`
            postContainer.append(card)

        })
        .catch(err => {
            snackbar('something went wrong while creating new blog', 'error')
        })
        .finally(() => {
            toggelSpineer(false)
        })
}





function onEdit(ele) {
    let EDIT_ID = ele.closest('.card').id
    cl(EDIT_ID)



    //edit_id store in ls
    localStorage.setItem("EDIT_ID", EDIT_ID)

    //EDIT URL
    const EDIT_URL = `${BASE_URL}/player/${EDIT_ID}.json`;
    cl(EDIT_URL)

    //API CALL
    fetch(EDIT_URL, {
        method: "GET",
        body: null,
        headers: {
            Auth: "Token From LS",
            'content-type': 'Application/json'
        }
    })
        .then(res => res.json())
        .then(data => {
            postTitleControl.value = data.Title;
            postContentControl.value = data.content;

            updatePostBtn.classList.remove("d-none");
            AddpostBtn.classList.add("d-none");



        })
        .catch(err => snackbar(err, 'error'))
        .finally(() => {
            toggelSpineer(false)
        })


}

function onUpdate() {
    toggelSpineer(true);

    //updated id
    let UPDATED_ID = localStorage.getItem('EDIT_ID')
    cl(UPDATED_ID)

    //updated url
    const UPDATED_URL = `${BASE_URL}/player/${UPDATED_ID}.json`
    cl(UPDATED_URL)

    //UPDATED_OBJ
    let UPDATED_OBJ = {
        Title: postTitleControl.value,
        content: postContentControl.value,
        id: UPDATED_ID
    }
    cl(UPDATED_OBJ)
    //blogForm.reset()
    fetch(UPDATED_URL, {
        method: 'PATCH',
        body: JSON.stringify(UPDATED_OBJ),
        headers: {
            Auth: "Token From LS",
            'Content-Type': 'Application/json'

        }
    })
        .then(res => {
            return res.json()
        })
        .then(data => {
            cl(data)//if api call successfully 

            //ui ko bhi upadate karo
            const card = document.getElementById(UPDATED_ID)
            card.querySelector('.card-header h3').innerHTML = data.Title
            card.querySelector('.card-body p').innerHTML = data.content

            blogForm.reset();

            updatePostBtn.classList.remove("d-none");
            AddpostBtn.classList.add("d-none");

            snackbar(`The post of id=${UPDATED_ID} updated successfully`, "success")

            blogForm.reset()

        })
        .catch(err => {
            cl(err);
            snackbar(`Something went wrong while updating post`, "error");
        })

        .finally(() => {
            toggelSpineer()


        })
}



updatePostBtn.addEventListener("click", onUpdate);

blogForm.addEventListener("submit", onblogAdd)










// const cl = console.log;


// const postForm = document.getElementById("postForm")
// const postTitleControl = document.getElementById("postTitle")
// const postContentControl = document.getElementById("postContent")
// const userIdControl = document.getElementById("userId")

// const loader = document.getElementById("loader")
// const AddpostBtn = document.getElementById("AddpostBtn")
// const updatePostBtn = document.getElementById("updatePostBtn")

// const postContainer = document.getElementById("postContainer")

// const BASE_URL = "https://playerblog-default-rtdb.firebaseio.com";
// const POST_URL = `${BASE_URL}/player.json`




// function toggelSpineer(flag) {
//     if (flag === true) {
//         loader.classList.remove('d-none')
//     } else {
//         loader.classList.add('d-none')
//     }
// }
// function snackbar(title, icon) {
//     Swal.fire({
//         title: title,
//         icon: icon,
//         timer: 1000,

//     });
// }

// const createCards = arr => {
//     let result = arr.map(post => {
//         return `
//             <div class="col-md-3 mb-4">
//                 <div class="card" id="${post.id}">
//                     <div class="card-header">
//                         <h3>${post.Title}</h3>
//                     </div>
//                     <div class="card-body">
//                         <p>${post.content}</p>
//                     </div>
//                     <div class="card-footer d-flex justify-content-between">
//                         <button class="btn btn-outline-primary btn-sm" onclick="onEdit(this)">Edit</button>
//                         <button class="btn btn-outline-danger btn-sm removeBtn" onclick="onremove(this)">Remove</button>
//                     </div>
//                 </div>
//             </div>
//         `;
//     }).join('');

//     postContainer.innerHTML = result;
// };

// const onremove = (ele) => {
//     Swal.fire({
//         title: "Do you want to Remove this blog",
//         showCancelButton: true,
//         confirmButtonColor: "#3085d6",
//         cancelButtonColor: "#d33",
//         confirmButtonText: "Yes, Remove it!"
//     }).then((result) => {
//         if (result.isConfirmed) {
//             let REMOVE_ID = ele.closest('.card').id
//             cl(REMOVE_ID)

//             //remove URL

//             const REMOVE_URL = `${BASE_URL}/player/${REMOVE_ID}.json`;

//             //API CALL
//             toggelSpineer(true)

//             fetch(REMOVE_URL, {
//                 method: "DELETE",
//                 body: null,
//                 headers: {
//                     Auth: "Token Form LS",
//                     "content-type": "Application/json"
//                 }
//             })
//                 .then(res => {
//                     return res.json()
//                 })
//                 .then(data => {
//                     cl(data)

//                     //IF API CALL SUCCESS THEN REMOVE FROM UI
//                     ele.closest('.col-md-3').remove();
//                     snackbar(`The blog with id ${REMOVE_ID} is removed successfully!!!`, "success");


//                 })
//                 .catch(err => {
//                     cl(err);
//                     snackbar("Something went wrong while deleting!", "error");
//                 })

//                 .finally(() => {
//                     toggelSpineer(false)
//                 })

//         }


//     })

// }



// let playerArr = []
// function playerObjArr(resObj) {


//     for (const key in resObj) {

//         resObj[key].id = key
//         playerArr.push(resObj[key])
//     }
//     return (playerArr)
// }

// function fetchBlogs() {
//     toggelSpineer(true)

//     fetch(POST_URL, {
//         method: "GET",
//         body: null,
//         headers: {
//             "Auth": "Token Form LS",
//             "content-type": "Application/json"
//         }
//     })
//         .then(res => {
//             return res.json()
//         })
//         //convert obj into array
//         .then(data => {
//             cl(data)
//             let playerArr = playerObjArr(data)
//             createCards(playerArr)
//         })
//         .catch(cl)
//         .finally(() => {
//             toggelSpineer(false)
//         })

// }
// fetchBlogs()


// function onblogAdd(e) {
//     e.preventDefault();


//     const blogObj = {
//         Title: postTitleControl.value,
//         content: postContentControl.value,

//     };
//     toggelSpineer(true);

//     fetch(POST_URL, {
//         method: 'POST',
//         body: JSON.stringify(blogObj),
//         headers: {
//             Auth: "Token Form LS",
//             "content-type": "Application/json"
//         }
//     })
//         .then(res => {
//             if (res.status >= 200 && res.status < 300) {
//                 return res.json()
//             }
//         })
//         .then(data => {
//             cl(data)
//             blogForm.reset()

//             ///create single card on ui
//             let card = document.createElement('div')
//             card.className = 'card mb-5 shadow rounded'
//             card.id = data.name;
//             card.innerHTML = `<div class="card-header">
//                         <h3>${blogObj.Title}<h3>
//                     </div>
//                     <div class="card-body">
//                         <p>${blogObj.content}</p>
//                     </div>
//                     <div class="card-footer d-flex justify-content-between">
//                         <button class="btn btn-outline-primary btn-sm" onclick = "onEdit(this)">Edit</button>
//                         <button  class="btn btn-outline-danger btn-sm removebtn" onclick = "onremove(this)">Remove</button>
//                     </div>`
//             postContainer.append(card)

//         })
//         .catch(err => {
//             snackbar('something went wrong while creating new blog', 'error')
//         })
//         .finally(() => {
//             toggelSpineer(false)
//         })
// }





// function onEdit(ele) {
//     let EDIT_ID = ele.closest('.card').id
//     cl(EDIT_ID)



//     //edit_id store in ls
//     localStorage.setItem("EDIT_ID", EDIT_ID)

//     //EDIT URL
//     const EDIT_URL = `${BASE_URL}/player/${EDIT_ID}.json`;
//     cl(EDIT_URL)

//     //API CALL
//     fetch(EDIT_URL, {
//         method: "GET",
//         body: null,
//         headers: {
//             Auth: "Token From LS",
//             'content-type': 'Application/json'
//         }
//     })
//         .then(res => res.json())
//         .then(data => {
//             postTitleControl.value = data.Title;
//             postContentControl.value = data.content;

//             updatePostBtn.classList.remove("d-none");
//             AddpostBtn.classList.add("d-none");



//         })
//         .catch(err => snackbar(err, 'error'))
//         .finally(() => {
//             toggelSpineer(false)
//         })


// }

// function onUpdate() {
//     toggelSpineer(true);

//     //updated id
//     let UPDATED_ID = localStorage.getItem('EDIT_ID')
//     cl(UPDATED_ID)

//     //updated url
//     const UPDATED_URL = `${BASE_URL}/player/${UPDATED_ID}.json`
//     cl(UPDATED_URL)

//     //UPDATED_OBJ
//     let UPDATED_OBJ = {
//         Title: postTitleControl.value,
//         content: postContentControl.value,
//         id: UPDATED_ID
//     }
//     cl(UPDATED_OBJ)
//     //blogForm.reset()
//     fetch(UPDATED_URL, {
//         method: 'PATCH',
//         body: JSON.stringify(UPDATED_OBJ),
//         headers: {
//             Auth: "Token From LS",
//             'Content-Type': 'Application/json'

//         }
//     })
//         .then(res => {
//             return res.json()
//         })
//         .then(data => {
//             cl(data)//if api call successfully

//             //ui ko bhi upadate karo
//             const card = document.getElementById(UPDATED_ID)
//             card.querySelector('.card-header h3').innerHTML = data.Title
//             card.querySelector('.card-body p').innerHTML = data.content

//             blogForm.reset();

//             updatePostBtn.classList.remove("d-none");
//             AddpostBtn.classList.add("d-none");

//             snackbar(`The post of id=${UPDATED_ID} updated successfully`, "success")

//             blogForm.reset()

//         })
//         .catch(err => {
//             cl(err);
//             snackbar(`Something went wrong while updating post`, "error");
//         })

//         .finally(() => {
//             toggelSpineer()


//         })
// }



// updatePostBtn.addEventListener("click", onUpdate);

// blogForm.addEventListener("submit", onblogAdd)










// const cl = console.log;


// const postForm = document.getElementById("postForm")
// const postTitleControl = document.getElementById("postTitle")
// const postContentControl = document.getElementById("postContent")
// const userIdControl = document.getElementById("userId")

// const loader = document.getElementById("loader")
// const AddpostBtn = document.getElementById("AddpostBtn")
// const updatePostBtn = document.getElementById("updatePostBtn")

// const postContainer = document.getElementById("postContainer")

// const BASE_URL = "https://playerblog-default-rtdb.firebaseio.com";
// const POST_URL = `${BASE_URL}/player.json`




// function toggelSpineer(flag) {
//     if (flag === true) {
//         loader.classList.remove('d-none')
//     } else {
//         loader.classList.add('d-none')
//     }
// }
// function snackbar(title, icon) {
//     Swal.fire({
//         title: title,
//         icon: icon,
//         timer: 1000,

//     });
// }

// const createCards = arr => {
//     let result = arr.map(post => {
//         return `
//             <div class="col-md-3 mb-4">
//                 <div class="card" id="${post.id}">
//                     <div class="card-header">
//                         <h3>${post.Title}</h3>
//                     </div>
//                     <div class="card-body">
//                         <p>${post.content}</p>
//                     </div>
//                     <div class="card-footer d-flex justify-content-between">
//                         <button class="btn btn-outline-primary btn-sm" onclick="onEdit(this)">Edit</button>
//                         <button class="btn btn-outline-danger btn-sm removeBtn" onclick="onremove(this)">Remove</button>
//                     </div>
//                 </div>
//             </div>
//         `;
//     }).join('');

//     postContainer.innerHTML = result;
// };

// const onremove = (ele) => {
//     Swal.fire({
//         title: "Do you want to Remove this blog",
//         showCancelButton: true,
//         confirmButtonColor: "#3085d6",
//         cancelButtonColor: "#d33",
//         confirmButtonText: "Yes, Remove it!"
//     }).then((result) => {
//         if (result.isConfirmed) {
//             let REMOVE_ID = ele.closest('.card').id
//             cl(REMOVE_ID)

//             //remove URL

//             const REMOVE_URL = `${BASE_URL}/player/${REMOVE_ID}.json`;

//             //API CALL
//             toggelSpineer(true)

//             fetch(REMOVE_URL, {
//                 method: "DELETE",
//                 body: null,
//                 headers: {
//                     Auth: "Token Form LS",
//                     "content-type": "Application/json"
//                 }
//             })
//                 .then(res => {
//                     return res.json()
//                 })
//                 .then(data => {
//                     cl(data)

//                     //IF API CALL SUCCESS THEN REMOVE FROM UI
//                     ele.closest('.col-md-3').remove();
//                     snackbar(`The blog with id ${REMOVE_ID} is removed successfully!!!`, "success");


//                 })
//                 .catch(err => {
//                     cl(err);
//                     snackbar("Something went wrong while deleting!", "error");
//                 })

//                 .finally(() => {
//                     toggelSpineer(false)
//                 })

//         }


//     })

// }



// let playerArr = []
// function playerObjArr(resObj) {


//     for (const key in resObj) {

//         resObj[key].id = key
//         playerArr.push(resObj[key])
//     }
//     return (playerArr)
// }

// function fetchBlogs() {
//     toggelSpineer(true)

//     fetch(POST_URL, {
//         method: "GET",
//         body: null,
//         headers: {
//             "Auth": "Token Form LS",
//             "content-type": "Application/json"
//         }
//     })
//         .then(res => {
//             return res.json()
//         })
//         //convert obj into array
//         .then(data => {
//             cl(data)
//             let playerArr = playerObjArr(data)
//             createCards(playerArr)
//         })
//         .catch(cl)
//         .finally(() => {
//             toggelSpineer(false)
//         })

// }
// fetchBlogs()


// function onblogAdd(e) {
//     e.preventDefault();


//     const blogObj = {
//         Title: postTitleControl.value,
//         content: postContentControl.value,

//     };
//     toggelSpineer(true);

//     fetch(POST_URL, {
//         method: 'POST',
//         body: JSON.stringify(blogObj),
//         headers: {
//             Auth: "Token Form LS",
//             "content-type": "Application/json"
//         }
//     })
//         .then(res => {
//             if (res.status >= 200 && res.status < 300) {
//                 return res.json()
//             }
//         })
//         .then(data => {
//             cl(data)
//             blogForm.reset()

//             ///create single card on ui
//             let card = document.createElement('div')
//             card.className = 'card mb-5 shadow rounded'
//             card.id = data.name;
//             card.innerHTML = `<div class="card-header">
//                         <h3>${blogObj.Title}<h3>
//                     </div>
//                     <div class="card-body">
//                         <p>${blogObj.content}</p>
//                     </div>
//                     <div class="card-footer d-flex justify-content-between">
//                         <button class="btn btn-outline-primary btn-sm" onclick = "onEdit(this)">Edit</button>
//                         <button  class="btn btn-outline-danger btn-sm removebtn" onclick = "onremove(this)">Remove</button>
//                     </div>`
//             postContainer.append(card)

//         })
//         .catch(err => {
//             snackbar('something went wrong while creating new blog', 'error')
//         })
//         .finally(() => {
//             toggelSpineer(false)
//         })
// }





// function onEdit(ele) {
//     let EDIT_ID = ele.closest('.card').id
//     cl(EDIT_ID)



//     //edit_id store in ls
//     localStorage.setItem("EDIT_ID", EDIT_ID)

//     //EDIT URL
//     const EDIT_URL = `${BASE_URL}/player/${EDIT_ID}.json`;
//     cl(EDIT_URL)

//     //API CALL
//     fetch(EDIT_URL, {
//         method: "GET",
//         body: null,
//         headers: {
//             Auth: "Token From LS",
//             'content-type': 'Application/json'
//         }
//     })
//         .then(res => res.json())
//         .then(data => {
//             postTitleControl.value = data.Title;
//             postContentControl.value = data.content;

//             updatePostBtn.classList.remove("d-none");
//             AddpostBtn.classList.add("d-none");



//         })
//         .catch(err => snackbar(err, 'error'))
//         .finally(() => {
//             toggelSpineer(false)
//         })


// }

// function onUpdate() {
//     toggelSpineer(true);

//     //updated id
//     let UPDATED_ID = localStorage.getItem('EDIT_ID')
//     cl(UPDATED_ID)

//     //updated url
//     const UPDATED_URL = `${BASE_URL}/player/${UPDATED_ID}.json`
//     cl(UPDATED_URL)

//     //UPDATED_OBJ
//     let UPDATED_OBJ = {
//         Title: postTitleControl.value,
//         content: postContentControl.value,
//         id: UPDATED_ID
//     }
//     cl(UPDATED_OBJ)
//     //blogForm.reset()
//     fetch(UPDATED_URL, {
//         method: 'PATCH',
//         body: JSON.stringify(UPDATED_OBJ),
//         headers: {
//             Auth: "Token From LS",
//             'Content-Type': 'Application/json'

//         }
//     })
//         .then(res => {
//             return res.json()
//         })
//         .then(data => {
//             cl(data)//if api call successfully

//             //ui ko bhi upadate karo
//             const card = document.getElementById(UPDATED_ID)
//             card.querySelector('.card-header h3').innerHTML = data.Title
//             card.querySelector('.card-body p').innerHTML = data.content

//             blogForm.reset();

//             updatePostBtn.classList.remove("d-none");
//             AddpostBtn.classList.add("d-none");

//             snackbar(`The post of id=${UPDATED_ID} updated successfully`, "success")

//             blogForm.reset()

//         })
//         .catch(err => {
//             cl(err);
//             snackbar(`Something went wrong while updating post`, "error");
//         })

//         .finally(() => {
//             toggelSpineer()


//         })
// }



// updatePostBtn.addEventListener("click", onUpdate);

// blogForm.addEventListener("submit", onblogAdd)
































// const cl = console.log;


// const postForm = document.getElementById("postForm")
// const postTitleControl = document.getElementById("postTitle")
// const postContentControl = document.getElementById("postContent")
// const userIdControl = document.getElementById("userId")

// const loader = document.getElementById("loader")
// const AddpostBtn = document.getElementById("AddpostBtn")
// const updatePostBtn = document.getElementById("updatePostBtn")

// const postContainer = document.getElementById("postContainer")

// const BASE_URL = "https://playerblog-default-rtdb.firebaseio.com";
// const POST_URL = `${BASE_URL}/player.json`




// function toggelSpineer(flag) {
//     if (flag === true) {
//         loader.classList.remove('d-none')
//     } else {
//         loader.classList.add('d-none')
//     }
// }
// function snackbar(title, icon) {
//     Swal.fire({
//         title: title,
//         icon: icon,
//         timer: 1000,

//     });
// }

// const createCards = arr => {
//     let result = arr.map(post => {
//         return `
//             <div class="col-md-3 mb-4">
//                 <div class="card" id="${post.id}">
//                     <div class="card-header">
//                         <h3>${post.Title}</h3>
//                     </div>
//                     <div class="card-body">
//                         <p>${post.content}</p>
//                     </div>
//                     <div class="card-footer d-flex justify-content-between">
//                         <button class="btn btn-outline-primary btn-sm" onclick="onEdit(this)">Edit</button>
//                         <button class="btn btn-outline-danger btn-sm removeBtn" onclick="onremove(this)">Remove</button>
//                     </div>
//                 </div>
//             </div>
//         `;
//     }).join('');

//     postContainer.innerHTML = result;
// };

// const onremove = (ele) => {
//     Swal.fire({
//         title: "Do you want to Remove this blog",
//         showCancelButton: true,
//         confirmButtonColor: "#3085d6",
//         cancelButtonColor: "#d33",
//         confirmButtonText: "Yes, Remove it!"
//     }).then((result) => {
//         if (result.isConfirmed) {
//             let REMOVE_ID = ele.closest('.card').id
//             cl(REMOVE_ID)

//             //remove URL

//             const REMOVE_URL = `${BASE_URL}/player/${REMOVE_ID}.json`;

//             //API CALL
//             toggelSpineer(true)

//             fetch(REMOVE_URL, {
//                 method: "DELETE",
//                 body: null,
//                 headers: {
//                     Auth: "Token Form LS",
//                     "content-type": "Application/json"
//                 }
//             })
//                 .then(res => {
//                     return res.json()
//                 })
//                 .then(data => {
//                     cl(data)

//                     //IF API CALL SUCCESS THEN REMOVE FROM UI
//                     ele.closest('.col-md-3').remove();
//                     snackbar(`The blog with id ${REMOVE_ID} is removed successfully!!!`, "success");


//                 })
//                 .catch(err => {
//                     cl(err);
//                     snackbar("Something went wrong while deleting!", "error");
//                 })

//                 .finally(() => {
//                     toggelSpineer(false)
//                 })

//         }


//     })

// }



// let playerArr = []
// function playerObjArr(resObj) {


//     for (const key in resObj) {

//         resObj[key].id = key
//         playerArr.push(resObj[key])
//     }
//     return (playerArr)
// }

// function fetchBlogs() {
//     toggelSpineer(true)

//     fetch(POST_URL, {
//         method: "GET",
//         body: null,
//         headers: {
//             "Auth": "Token Form LS",
//             "content-type": "Application/json"
//         }
//     })
//         .then(res => {
//             return res.json()
//         })
//         //convert obj into array
//         .then(data => {
//             cl(data)
//             let playerArr = playerObjArr(data)
//             createCards(playerArr)
//         })
//         .catch(cl)
//         .finally(() => {
//             toggelSpineer(false)
//         })

// }
// fetchBlogs()


// function onblogAdd(e) {
//     e.preventDefault();


//     const blogObj = {
//         Title: postTitleControl.value,
//         content: postContentControl.value,

//     };
//     toggelSpineer(true);

//     fetch(POST_URL, {
//         method: 'POST',
//         body: JSON.stringify(blogObj),
//         headers: {
//             Auth: "Token Form LS",
//             "content-type": "Application/json"
//         }
//     })
//         .then(res => {
//             if (res.status >= 200 && res.status < 300) {
//                 return res.json()
//             }
//         })
//         .then(data => {
//             cl(data)
//             blogForm.reset()

//             ///create single card on ui
//             let card = document.createElement('div')
//             card.className = 'card mb-5 shadow rounded'
//             card.id = data.name;
//             card.innerHTML = `<div class="card-header">
//                         <h3>${blogObj.Title}<h3>
//                     </div>
//                     <div class="card-body">
//                         <p>${blogObj.content}</p>
//                     </div>
//                     <div class="card-footer d-flex justify-content-between">
//                         <button class="btn btn-outline-primary btn-sm" onclick = "onEdit(this)">Edit</button>
//                         <button  class="btn btn-outline-danger btn-sm removebtn" onclick = "onremove(this)">Remove</button>
//                     </div>`
//             postContainer.append(card)

//         })
//         .catch(err => {
//             snackbar('something went wrong while creating new blog', 'error')
//         })
//         .finally(() => {
//             toggelSpineer(false)
//         })
// }





// function onEdit(ele) {
//     let EDIT_ID = ele.closest('.card').id
//     cl(EDIT_ID)



//     //edit_id store in ls
//     localStorage.setItem("EDIT_ID", EDIT_ID)

//     //EDIT URL
//     const EDIT_URL = `${BASE_URL}/player/${EDIT_ID}.json`;
//     cl(EDIT_URL)

//     //API CALL
//     fetch(EDIT_URL, {
//         method: "GET",
//         body: null,
//         headers: {
//             Auth: "Token From LS",
//             'content-type': 'Application/json'
//         }
//     })
//         .then(res => res.json())
//         .then(data => {
//             postTitleControl.value = data.Title;
//             postContentControl.value = data.content;

//             updatePostBtn.classList.remove("d-none");
//             AddpostBtn.classList.add("d-none");



//         })
//         .catch(err => snackbar(err, 'error'))
//         .finally(() => {
//             toggelSpineer(false)
//         })


// }

// function onUpdate() {
//     toggelSpineer(true);

//     //updated id
//     let UPDATED_ID = localStorage.getItem('EDIT_ID')
//     cl(UPDATED_ID)

//     //updated url
//     const UPDATED_URL = `${BASE_URL}/player/${UPDATED_ID}.json`
//     cl(UPDATED_URL)

//     //UPDATED_OBJ
//     let UPDATED_OBJ = {
//         Title: postTitleControl.value,
//         content: postContentControl.value,
//         id: UPDATED_ID
//     }
//     cl(UPDATED_OBJ)
//     //blogForm.reset()
//     fetch(UPDATED_URL, {
//         method: 'PATCH',
//         body: JSON.stringify(UPDATED_OBJ),
//         headers: {
//             Auth: "Token From LS",
//             'Content-Type': 'Application/json'

//         }
//     })
//         .then(res => {
//             return res.json()
//         })
//         .then(data => {
//             cl(data)//if api call successfully

//             //ui ko bhi upadate karo
//             const card = document.getElementById(UPDATED_ID)
//             card.querySelector('.card-header h3').innerHTML = data.Title
//             card.querySelector('.card-body p').innerHTML = data.content

//             blogForm.reset();

//             updatePostBtn.classList.remove("d-none");
//             AddpostBtn.classList.add("d-none");

//             snackbar(`The post of id=${UPDATED_ID} updated successfully`, "success")

//             blogForm.reset()

//         })
//         .catch(err => {
//             cl(err);
//             snackbar(`Something went wrong while updating post`, "error");
//         })

//         .finally(() => {
//             toggelSpineer()


//         })
// }



// updatePostBtn.addEventListener("click", onUpdate);

// blogForm.addEventListener("submit", onblogAdd)

















// const cl = console.log;


// const postForm = document.getElementById("postForm")
// const postTitleControl = document.getElementById("postTitle")
// const postContentControl = document.getElementById("postContent")
// const userIdControl = document.getElementById("userId")

// const loader = document.getElementById("loader")
// const AddpostBtn = document.getElementById("AddpostBtn")
// const updatePostBtn = document.getElementById("updatePostBtn")

// const postContainer = document.getElementById("postContainer")

// const BASE_URL = "https://playerblog-default-rtdb.firebaseio.com";
// const POST_URL = `${BASE_URL}/player.json`




// function toggelSpineer(flag) {
//     if (flag === true) {
//         loader.classList.remove('d-none')
//     } else {
//         loader.classList.add('d-none')
//     }
// }
// function snackbar(title, icon) {
//     Swal.fire({
//         title: title,
//         icon: icon,
//         timer: 1000,

//     });
// }

// const createCards = arr => {
//     let result = arr.map(post => {
//         return `
//             <div class="col-md-3 mb-4">
//                 <div class="card" id="${post.id}">
//                     <div class="card-header">
//                         <h3>${post.Title}</h3>
//                     </div>
//                     <div class="card-body">
//                         <p>${post.content}</p>
//                     </div>
//                     <div class="card-footer d-flex justify-content-between">
//                         <button class="btn btn-outline-primary btn-sm" onclick="onEdit(this)">Edit</button>
//                         <button class="btn btn-outline-danger btn-sm removeBtn" onclick="onremove(this)">Remove</button>
//                     </div>
//                 </div>
//             </div>
//         `;
//     }).join('');

//     postContainer.innerHTML = result;
// };

// const onremove = (ele) => {
//     Swal.fire({
//         title: "Do you want to Remove this blog",
//         showCancelButton: true,
//         confirmButtonColor: "#3085d6",
//         cancelButtonColor: "#d33",
//         confirmButtonText: "Yes, Remove it!"
//     }).then((result) => {
//         if (result.isConfirmed) {
//             let REMOVE_ID = ele.closest('.card').id
//             cl(REMOVE_ID)

//             //remove URL

//             const REMOVE_URL = `${BASE_URL}/player/${REMOVE_ID}.json`;

//             //API CALL
//             toggelSpineer(true)

//             fetch(REMOVE_URL, {
//                 method: "DELETE",
//                 body: null,
//                 headers: {
//                     Auth: "Token Form LS",
//                     "content-type": "Application/json"
//                 }
//             })
//                 .then(res => {
//                     return res.json()
//                 })
//                 .then(data => {
//                     cl(data)

//                     //IF API CALL SUCCESS THEN REMOVE FROM UI
//                     ele.closest('.col-md-3').remove();
//                     snackbar(`The blog with id ${REMOVE_ID} is removed successfully!!!`, "success");


//                 })
//                 .catch(err => {
//                     cl(err);
//                     snackbar("Something went wrong while deleting!", "error");
//                 })

//                 .finally(() => {
//                     toggelSpineer(false)
//                 })

//         }


//     })

// }



// let playerArr = []
// function playerObjArr(resObj) {


//     for (const key in resObj) {

//         resObj[key].id = key
//         playerArr.push(resObj[key])
//     }
//     return (playerArr)
// }

// function fetchBlogs() {
//     toggelSpineer(true)

//     fetch(POST_URL, {
//         method: "GET",
//         body: null,
//         headers: {
//             "Auth": "Token Form LS",
//             "content-type": "Application/json"
//         }
//     })
//         .then(res => {
//             return res.json()
//         })
//         //convert obj into array
//         .then(data => {
//             cl(data)
//             let playerArr = playerObjArr(data)
//             createCards(playerArr)
//         })
//         .catch(cl)
//         .finally(() => {
//             toggelSpineer(false)
//         })

// }
// fetchBlogs()


// function onblogAdd(e) {
//     e.preventDefault();


//     const blogObj = {
//         Title: postTitleControl.value,
//         content: postContentControl.value,

//     };
//     toggelSpineer(true);

//     fetch(POST_URL, {
//         method: 'POST',
//         body: JSON.stringify(blogObj),
//         headers: {
//             Auth: "Token Form LS",
//             "content-type": "Application/json"
//         }
//     })
//         .then(res => {
//             if (res.status >= 200 && res.status < 300) {
//                 return res.json()
//             }
//         })
//         .then(data => {
//             cl(data)
//             blogForm.reset()

//             ///create single card on ui
//             let card = document.createElement('div')
//             card.className = 'card mb-5 shadow rounded'
//             card.id = data.name;
//             card.innerHTML = `<div class="card-header">
//                         <h3>${blogObj.Title}<h3>
//                     </div>
//                     <div class="card-body">
//                         <p>${blogObj.content}</p>
//                     </div>
//                     <div class="card-footer d-flex justify-content-between">
//                         <button class="btn btn-outline-primary btn-sm" onclick = "onEdit(this)">Edit</button>
//                         <button  class="btn btn-outline-danger btn-sm removebtn" onclick = "onremove(this)">Remove</button>
//                     </div>`
//             postContainer.append(card)

//         })
//         .catch(err => {
//             snackbar('something went wrong while creating new blog', 'error')
//         })
//         .finally(() => {
//             toggelSpineer(false)
//         })
// }





// function onEdit(ele) {
//     let EDIT_ID = ele.closest('.card').id
//     cl(EDIT_ID)



//     //edit_id store in ls
//     localStorage.setItem("EDIT_ID", EDIT_ID)

//     //EDIT URL
//     const EDIT_URL = `${BASE_URL}/player/${EDIT_ID}.json`;
//     cl(EDIT_URL)

//     //API CALL
//     fetch(EDIT_URL, {
//         method: "GET",
//         body: null,
//         headers: {
//             Auth: "Token From LS",
//             'content-type': 'Application/json'
//         }
//     })
//         .then(res => res.json())
//         .then(data => {
//             postTitleControl.value = data.Title;
//             postContentControl.value = data.content;

//             updatePostBtn.classList.remove("d-none");
//             AddpostBtn.classList.add("d-none");



//         })
//         .catch(err => snackbar(err, 'error'))
//         .finally(() => {
//             toggelSpineer(false)
//         })


// }

// function onUpdate() {
//     toggelSpineer(true);

//     //updated id
//     let UPDATED_ID = localStorage.getItem('EDIT_ID')
//     cl(UPDATED_ID)

//     //updated url
//     const UPDATED_URL = `${BASE_URL}/player/${UPDATED_ID}.json`
//     cl(UPDATED_URL)

//     //UPDATED_OBJ
//     let UPDATED_OBJ = {
//         Title: postTitleControl.value,
//         content: postContentControl.value,
//         id: UPDATED_ID
//     }
//     cl(UPDATED_OBJ)
//     //blogForm.reset()
//     fetch(UPDATED_URL, {
//         method: 'PATCH',
//         body: JSON.stringify(UPDATED_OBJ),
//         headers: {
//             Auth: "Token From LS",
//             'Content-Type': 'Application/json'

//         }
//     })
//         .then(res => {
//             return res.json()
//         })
//         .then(data => {
//             cl(data)//if api call successfully

//             //ui ko bhi upadate karo
//             const card = document.getElementById(UPDATED_ID)
//             card.querySelector('.card-header h3').innerHTML = data.Title
//             card.querySelector('.card-body p').innerHTML = data.content

//             blogForm.reset();

//             updatePostBtn.classList.remove("d-none");
//             AddpostBtn.classList.add("d-none");

//             snackbar(`The post of id=${UPDATED_ID} updated successfully`, "success")

//             blogForm.reset()

//         })
//         .catch(err => {
//             cl(err);
//             snackbar(`Something went wrong while updating post`, "error");
//         })

//         .finally(() => {
//             toggelSpineer()


//         })
// }



// updatePostBtn.addEventListener("click", onUpdate);

// blogForm.addEventListener("submit", onblogAdd)















