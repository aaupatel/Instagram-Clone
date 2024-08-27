document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('.like-Comment').forEach(button => {
        button.addEventListener('click', function() {
            const commentId = this.dataset.commentId;
            const postId = this.dataset.postId;
            const heartIcon = this.querySelector('.heart');
            const likesVal = this.previousElementSibling.querySelector('.likeval');
            
            let like;
            if (heartIcon.classList.contains('ri-heart-line')) {
                heartIcon.classList.remove('ri-heart-line');
                heartIcon.classList.add('ri-heart-3-fill', 'text-red-500');
                likesVal.textContent = parseInt(likesVal.textContent) + 1 + " likes"; 
                like = true;
            } else {
                heartIcon.classList.remove('ri-heart-3-fill', 'text-red-500');
                heartIcon.classList.add('ri-heart-line');
                likesVal.textContent = parseInt(likesVal.textContent) - 1 + " likes";
                like = false;
            }
            
            fetch(`/likeComment/${commentId}`)
            .then((raw) => raw.json())
            .then(data => {
                // console.log(`Like Comment ID: ${commentId}, Likes: ${data.likes}`);
            })
            .catch(error => {
                console.error('Error:', error);
            });
            // console.log(`Like Comment ID: ${commentId}, Post ID: ${postId}`);
            });
    });
    document.querySelectorAll('.like-Reply').forEach(button => {
        button.addEventListener('click', function() {
          const replyId = this.dataset.replyId;
          const postId = this.dataset.postId;
          const heartIcon = this.querySelector('.heart');
          const likesVal = this.previousElementSibling.querySelector('.likeval'); 
      
          let like;
          if (heartIcon.classList.contains('ri-heart-line')) {
            heartIcon.classList.remove('ri-heart-line');
            heartIcon.classList.add('ri-heart-3-fill', 'text-red-500');
            likesVal.textContent = parseInt(likesVal.textContent) + 1 + " likes"; 
            like = true;
          } else {
            heartIcon.classList.remove('ri-heart-3-fill', 'text-red-500');
            heartIcon.classList.add('ri-heart-line');
            likesVal.textContent = parseInt(likesVal.textContent) - 1 + " likes";
            like = false;
          }
          fetch(`/likeReply/${replyId}`)
          .then(response => response.json())
          .then(data => {
            // console.log(`Like Reply ID: ${replyId}, Likes: ${data.likes}`);
          })
          .catch(error => {
            console.error('Error:', error);
          });
      
          // console.log(`Like Reply ID: ${replyId}, Post ID: ${postId}`);
        });
    });
});

function toggleComment(commentId) {
    var moreText = document.getElementById(`moreComment${commentId}`);
    var btnText = document.getElementById(`toggleCommentBtn${commentId}`);
    
    if (moreText.style.display === "none") {
        moreText.style.display = "inline";
        btnText.textContent = "...less";
    } else {
        moreText.style.display = "none";
        btnText.textContent = "...more";
    }
}

function toggleCaption(postId) {
    var moreText = document.getElementById(`moreCaption${postId}`);
    var btnText = document.getElementById(`toggleCaptionBtn${postId}`);

    if (moreText.style.display === "none") {
        moreText.style.display = "inline";
        btnText.textContent = "...less";
    } else {
        moreText.style.display = "none";
        btnText.textContent = "...more";
    }
}

function formatRelativeTime(date) {
    const parsedDate = new Date(date);
    const now = new Date();
    const diff = now - parsedDate;

    const seconds = Math.floor(diff / 1000);
    if (seconds < 60) {
        return `${seconds}s`;
    }

    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) {
        return `${minutes}m`;
    }

    const hours = Math.floor(minutes / 60);
    if (hours < 24) {
        return `${hours}h`;
    }

    const days = Math.floor(hours / 24);
    if (days < 7) {
        return `${days}d`;
    }

    const weeks = Math.floor(days / 7);
    return `${weeks}w`;
}

document.querySelector(".parent").addEventListener("click", function (e) {
    if (e.target.classList.contains("postimg")) {
        var post = e.target.closest(".post");
        var heartwithborder = post.querySelector(".heart");
        if (heartwithborder.classList.contains("ri-heart-3-line")) {
            heartwithborder.classList.remove("ri-heart-3-line");
            heartwithborder.classList.add("ri-heart-3-fill", "text-red-500");
        } else {
            heartwithborder.classList.remove("ri-heart-3-fill", "text-red-500");
            heartwithborder.classList.add("ri-heart-3-line");
        }
        fetch(`/like/${e.target.dataset.postid}`)
        .then((raw) => raw.json())
        .then((response) => {
            post.querySelector(".likeval").textContent =
            response.like.length + " likes";
        });

        var icon = document.createElement("i");
        icon.classList.add(
            "ri-heart-3-fill",
            "text-red-700",
            "text-6xl",
            "absolute",
            "top-1/2",
            "left-1/2",
            "-translate-x-[50%]",
            "-translate-y-[50%]",
            "z-[9]"
        );
        e.target.parentNode.appendChild(icon);
        
        gsap.from(icon, {
            scale: 0.5,
            y: 30,
            opacity: 0,
            ease: Expo,
            duration: 0.3,
        });

        gsap.to(icon, {
            scale: 0,
            y: -30,
            opacity: 0,
            duration: 0.3,
            ease: Expo,
            delay: 0.3,
            onComplete: () => {
                e.target.parentNode.removeChild(icon);
            },
        });
    } else if (e.target.classList.contains("save")) {
        var id = e.target.dataset.postid;
        fetch(`/save/${id}`)
        .then((raw) => raw.json())
        .then((result) => {
            if (!e.target.classList.contains("ri-bookmark-line")) {
                e.target.classList.remove("ri-bookmark-fill", "text-zinc-100");
                e.target.classList.add("ri-bookmark-line");
            } else {
                e.target.classList.remove("ri-bookmark-line");
                e.target.classList.add("ri-bookmark-fill", "text-zinc-100");
            }
        });
    } else if (e.target.classList.contains("comments-toggler")) {
        var postId = e.target.getAttribute("data-post-id");
        document.querySelectorAll(".comments-modal").forEach((modal) => {
            if (modal.getAttribute("data-post-id") === postId) {
                modal.style.display = "block";
            }
        });
    }
});

document.querySelectorAll(".down-modal").forEach((button) => {
    button.addEventListener("click", () => {
        document.querySelectorAll(".comments-modal").forEach((modal) => {
            modal.style.display = "none";
        });
        location.reload();
    });
});

document.querySelectorAll(".comment-btn").forEach((button) => {
    button.addEventListener("click", function () {
        const commentBox =
        this.closest(".input-section").querySelector(".comment-box");
        const postId = commentBox.dataset.postid;
        const comment = commentBox.value.trim();

        const replyUsername = commentBox.getAttribute("data-reply-username");
        const commentId = commentBox.getAttribute("data-reply-comment-id");

        if (replyUsername && commentId) {
            // console.log(`Replying to comment ID: ${commentId} by ${replyUsername} on post ID: ${postId} with comment = ${comment}`);
            if (comment === "") return;
            fetch(`/${commentId}/reply`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ text: comment, postId: postId }),
            })
            .then((response) => response.json())
            .then((reply) => {
                appendReply(commentId, reply, postId);
                commentBox.value = "";
                commentBox.removeAttribute("data-reply-username");
                commentBox.removeAttribute("data-reply-comment-id");
            })
            .catch((error) => console.error("Error:", error));
        } else {
            // console.log(`Posting new comment on post ID: ${postId} with comment = ${comment}`);
            if (comment === "") return;
            fetch(`/${postId}/comment`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ text: comment }),
            })
            .then((response) => response.json())
            .then((comment) => {
                appendComment(postId, comment);
                commentBox.value = "";
            })
            .catch((error) => console.error("Error:", error));
        }
    });
});

document.querySelectorAll(".reply-btn").forEach(function (btn) {
    btn.addEventListener("click", function () {
        const postId = this.dataset.postId;
        const commentId = this.dataset.commentId;
        const commentUsername = this.dataset.commentUsername;
        const commentPicture = this.dataset.commentPicture;
    
        // console.log(`Replying to comment ID: ${commentId} by ${commentUsername} on post ID: ${postId}`);

        const replyingToSection = document.querySelector(
            `.comments-modal[data-post-id="${postId}"] .reply-to-user`
        );
        if (replyingToSection) {
            replyingToSection.classList.remove("hidden");
            const usernameElement =
            replyingToSection.querySelector("#reply-username");
            const pictureElement = replyingToSection.querySelector("img");
            if (usernameElement && pictureElement) {
                usernameElement.textContent =
                commentUsername.length > 20  ? commentUsername.substring(0, 20) + "..." : commentUsername;
                pictureElement.src = commentPicture;
            } else {
                console.error("Reply-to section elements not found");
            }
            const commentBox = document.querySelector(`.comments-modal[data-post-id="${postId}"] .comment-box`);
            if (commentBox) {
                commentBox.placeholder = `Reply to ${
                    commentUsername.length > 30 ? commentUsername.substring(0, 30) + "..." : commentUsername
                }`;
                commentBox.setAttribute("data-reply-username", commentUsername);
                commentBox.setAttribute("data-reply-comment-id", commentId);
            } else {
                console.error("Comment box not found");
            }
        } else {
            console.error("Reply-to section not found");
        }
    });
});

document.querySelectorAll(".remove-btn").forEach(function (btn) {
    btn.addEventListener("click", function () {
        const replyingToSection = this.closest(".reply-to-user");
        if (replyingToSection) {
            replyingToSection.classList.add("hidden");
            const commentBox = replyingToSection
            .closest(".comments-modal")
            .querySelector(".comment-box");
            if (commentBox) {
                commentBox.placeholder = "Write a comment...";
                commentBox.removeAttribute("data-reply-username");
                commentBox.removeAttribute("data-reply-comment-id");
            } else {
                console.error("Comment box not found");
            }
        } else {
            console.error("Reply-to section not found");
        }
    });
});

function appendReply(commentId, reply, postId) {
    const repliesContainer = document.getElementById(`replies-container-${commentId}`);
    const formattedDate = formatRelativeTime(reply.date);
    const newReplyHTML = `
    <div class="flex gap-2 mt-2">
        <div class="w-[9vw] h-[9vw] bg-sky-100 rounded-full overflow-hidden self-start">
            <img class="w-full h-full object-cover" src="${reply.user.picture}" alt="Profile Image">
        </div>
        <div class="flex-1">
          <a href="/profile/${reply.user._id}" class="outline-none">
            <h4 class="text-sm font-semibold text-white">
              ${reply.user ? (reply.user.username.length > 10 ? reply.user.username.substring(0, 10) + '...' : reply.user.username) : 'Unknown'}
          </a>
              <span class="text-sm text-gray-600 ml-2">${formattedDate}</span>
            </h4>
            <h6 class="text-sm text-white break-all">${reply.text}</h6>
            <div class="flex items-center gap-4 mt-0.5">
                <span class="text-sm text-gray-600">0 likes</span>
                <button class="text-sm text-gray-600 reply-btn" data-comment-id="${commentId}" data-comment-username="${reply.user.username}" data-comment-picture="${reply.user.picture}" data-post-id="${postId}">Reply</button>
            </div>
        </div>
        <button class="text-gray-600 flex items-center self-start mt-1">
            <i class="ri-heart-line text-xl"></i>
        </button>
    </div>
    `;
    repliesContainer.insertAdjacentHTML('beforeend', newReplyHTML);
}

function appendComment(postId, comment) {
    const commentsContainer = document.getElementById(`comments-container-${postId}`);
    const formattedDate = formatRelativeTime(comment.date);
    const picture = comment.user && comment.user.picture ? comment.user.picture : 'default.png';
    const newCommentHTML = `
    <a href="#" class="block px-2 py-1">
        <div class="flex gap-2">
            <div class="w-[9vw] h-[9vw] bg-sky-100 rounded-full overflow-hidden self-start">
                <img class="w-full h-full object-cover" src="${picture}" alt="Profile Image">
            </div>
            <div class="flex-1">
              <a href="/profile/${comment.user._id}" class="outline-none">
                <h4 class="text-sm font-semibold text-white">
                  ${comment.user ? (comment.user.username.length > 10 ? comment.user.username.substring(0, 10) + '...' : comment.user.username) : 'Unknown'}
              </a>
                  <span class="text-sm text-gray-600 ml-2">${formattedDate}</span>
                </h4>
                <h6 class="text-sm text-white break-all">${comment.text}</h6>
                <div class="flex items-center gap-4 mt-0.5">
                    <span class="text-sm text-gray-600">0 likes</span>
                    <button class="text-sm text-gray-600 reply-btn" data-comment-id="${comment._id}" data-comment-username="${comment.user ? comment.user.username : 'Unknown'}" data-comment-picture="${picture}" data-post-id="${postId}">Reply</button>
                </div>
            </div>
            <button class="text-gray-600 flex items-center self-start mt-1">
                <i class="ri-heart-line text-xl"></i>
            </button>
        </div>
        <div id="replies-container-${comment._id}" class="ml-8"></div>
    </a>
    `;
    commentsContainer.insertAdjacentHTML('beforeend', newCommentHTML);
}
