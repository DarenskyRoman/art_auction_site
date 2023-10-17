$(function () {
  // прогрузка баланса и аватарки
  $.post("../../scripts/getUserHeadInfo.php", {}, function (data) {
    result = JSON.parse(data);
    stats = result.data;
    if (result.success == 1) {
      $("#balance").text(stats.balance);
      $(".miniprofile-pic").attr("src", stats.profile_picture);
    } else {
      alert("Ошибка при подгрузке шапки");
    }
  });

  // Выбираем элементы модального окна
  let modal = $("#modal");
  let modalHeader = modal.find(".modal-header");
  let uploadButton = modalHeader.find(".upload-photo");
  let publishButton = modal.find(".publish-button");

  // Обработчик клика на элемент, который открывает модальное окно
  if ($(".nav-item-plus").length) {
    $(".nav-item-plus").on("click", function (event) {
      event.stopPropagation();
      modal.show();
      $("body").addClass("modal-open");
    });
  }

  // Получаем список стилей и генерируем список в выпадающем меню
  $.post("../../scripts/getStyles.php", {}, function (data) {
    let result = JSON.parse(data);

    generateStyles(result);
  }).fail(function (xhr, status, error) {
    console.log("Произошла ошибка" + xhr + status + error);
  });

  function generateStyles(styles) {
    let styleList = $("#paint-style");

    $.each(styles, function (i, styles) {
      let styleItem = $("<option>")
        .text(styles.name)
        .attr("value", styles.style_id);

      styleList.append(styleItem);
    });
  }

  // Ограничение максимального количества символов в paint-name до 50
  const nameInput = $("#paint-name");
  nameInput.on("input", function () {
    const maxLength = 50;
    if (nameInput.val().length > maxLength) {
      nameInput.val(nameInput.val().slice(0, maxLength));
    }
  });

  // Ограничение максимального количества символов в paint-description до 150
  const aboutInput = $("#paint-description");
  aboutInput.on("input", function () {
    const maxLength = 150;
    if (aboutInput.val().length > maxLength) {
      aboutInput.val(aboutInput.val().slice(0, maxLength));
    }
  });

  $("#photo-upload").change(function () {
    let file = this.files[0];
    /* console.log("Выбранный файл:", file); // добавлено для вывода информации о файле в консоль */
    let reader = new FileReader();
    reader.onload = function (event) {
      let image = new Image();
      image.src = event.target.result;
      image.onload = function () {
        if (image.width < 400 || image.height < 400) {
          alert("Минимальный размер изображения должен быть 400x400.");
          return false;
        } else {
          $(".select-image").hide();
          $(".upload-photo").css({
            "background-image": "url(" + event.target.result + ")",
            "background-size": "cover",
            "background-position": "center",
          });
        }
      };
    };
    reader.readAsDataURL(file);
  });

  $(".modal").click(function (event) {
    if ($(event.target).hasClass("modal")) {
      $(this).hide();
    }
  });

  // Обработчик клика на кнопку "Publish"
  publishButton.on("click", function (event) {
    event.preventDefault();

    // Получаем значение поля с именем картины и проверяем на пустое значение
    const name = nameInput.val().trim();
    if (!name) {
      alert("Имя картины не может быть пустым");
      return;
    }

    $(".publish-button").on("click", function () {
      let fileInput = $("#photo-upload");
      let file = fileInput[0].files[0];

      if (!file) {
        alert("Please select a file to upload.");
        return false;
      }

      let formData = new FormData($("form")[0]); // создаем объект FormData с данными формы
      formData.append("image", file); // добавляем данные о файле в объект FormData

      // выводим содержимое объекта FormData в консоль
      for (let pair of formData.entries()) {
        console.log(pair[0] + ": " + pair[1]);
      }

      console.log("Form data:", formData);
      console.log("File:", file);

      $.ajax({
        url: "../../scripts/createPost.php", // адрес обработчика формы на сервере
        type: "POST",
        data: formData, // данные формы
        processData: false,
        contentType: false,
        success: function (response) {
          // код, который будет выполнен после успешной отправки формы
          console.log(response);
          location.reload(); // перезагрузить страницу после успешной отправки формы
        },
        error: function (jqXHR, textStatus, errorMessage) {
          // код, который будет выполнен в случае ошибки отправки формы
          console.log(errorMessage);
        },
      });
    });
  });
  $(".search-input").on("input", function (event) {
    // Получение введенного текста из поля поиска
    let searchQuery = $(this).val().trim();
    // Отправка запроса на сервер только если текст запроса не пустой
    if (searchQuery !== "") {
      $.ajax({
        type: "POST",
        url: "../../scripts/searchUser.php",
        data: { login: searchQuery, limit: 10 },
        dataType: "json",
        success: function (response) {
          if (response.status == "1") {
            // Очистка списка результатов поиска перед добавлением новых
            $(".search-results").empty();
            // Добавление каждого результата поиска в список
            $.each(response.data, function (index, user) {
              let userProfileLink =
                '<a href="../../profile/HTML/profile.html?id=' +
                user.user_id +
                '"><img src="' +
                user.profile_picture +
                '"> ' +
                user.login +
                "</a>";
              $(".search-results").append("<li>" + userProfileLink + "</li>");
            });
            // Отображение списка результатов поиска
            $(".search-results").show();
            // Если есть результаты поиска, перейти на первый результат при нажатии Enter
            if (response.data.length > 0) {
              $(document).on("keypress", function (e) {
                if (e.which === 13) {
                  window.location.href = $(
                    ".search-results li:first-child a"
                  ).attr("href");
                }
              });
            }
          }
        },
      });
    } else {
      // Скрытие списка результатов поиска, если поле поиска пустое
      $(".search-results").hide();
    }
  });

  // Скрытие списка результатов поиска при клике вне поля поиска или списка
  $(document).mouseup(function (e) {
    let searchResults = $(".search-results");
    if (
      !searchResults.is(e.target) &&
      searchResults.has(e.target).length === 0 &&
      !$(".search-input").is(e.target)
    ) {
      searchResults.hide();
    }
  });
});
