const app = angular.module("myApp", ["ui.bootstrap"]);

app.filter("beginning_data", function () {
    return function (input, begin) {
        if (input) {
            begin = +begin;
            return input.slice(begin);
        }
        return [];
    };
});

app.controller("myCtrl", ($scope, $http, $timeout) => {
    //calender (week)
    let curr = new Date(); // get current date
    let week = [];

    for (let i = 1; i <= 7; i++) {
        let first = curr.getDate() - curr.getDay() + i;
        let day = new Date(curr.setDate(first));
        week.push(day);
    }

    $scope.currentDay = new Date();
    $scope.mon = week[0];
    $scope.tue = week[1];
    $scope.wed = week[2];
    $scope.thur = week[3];
    $scope.fri = week[4];

    $scope.current_grid = 1;
    $scope.data_limit = String(10);

    $scope.page_position = function (page_number) {
        $scope.current_grid = page_number;
    };

    $scope.filter = function () {
        $timeout(function () {
            $scope.filter_data = $scope.searched.length;
        }, 20);
    };
    $scope.sort_with = function (base) {
        $scope.base = base;
        $scope.reverse = !$scope.reverse;
    };

    $scope.btnFilter = (data) => {
        $scope.mySearch = data;
    };

    $scope.periodFilter = (data) => {
        $scope.period = data;
    };

    //error msg
    $scope.errorMsg = (title, html) => {
        Swal.fire({
            icon: "error",
            title: title,
            html: html,
            showConfirmButton: false,
            timer: 3000,
        });
    };

    //warning msg
    $scope.warningMsg = (title, html) => {
        Swal.fire({
            icon: "warning",
            title: title,
            html: html,
            showConfirmButton: false,
            timer: 3000,
        });
    };

    //prompt msg
    $scope.promptMsg = (title, html) => {
        Swal.fire({
            icon: "info",
            title: title,
            html: html,
            showConfirmButton: false,
            timer: 3000,
        });
    };

    //success msg
    $scope.successMsg = (title, html) => {
        Swal.fire({
            icon: "success",
            title: title,
            html: html,
            showConfirmButton: false,
            timer: 3000,
        });
    };

    //login user
    $scope.loginUser = () => {
        $("#btn-userLogin")
            .html(
                '<span class="spinner-border spinner-border-sm mr-2" role="status" aria-hidden="true"></span> Authenticating...'
            )
            .addClass("disabled");

        //generate reCAPTCHA token
        grecaptcha.ready(function () {
            // do request for recaptcha token
            // response is promise with passed token
            grecaptcha
                .execute("6LcHrTkjAAAAABmHlk0bAoNpUpRE1Z--CGM91w8f", {
                    action: "validate_captcha",
                })
                .then(function (token) {
                    const data = {
                        email: String($scope.userEmail),
                        password: String($scope.userPassword),
                        rememberMe: Boolean($scope.rememberMe),
                        token,
                    };

                    $http.post("/signin", data).then((res) => {
                        $("#btn-userLogin").html("Sign in").removeClass("disabled");
                        res.data.user
                            ? location.assign("/user")
                            : $scope.warningMsg("", res.data.err);
                    });
                });
        });
    };

    $scope.loginStudent = () => {
        $("#btn-studentLogin")
            .html(
                '<span class="spinner-border spinner-border-sm mr-2" role="status" aria-hidden="true"></span> Authenticating...'
            )
            .addClass("disabled");

        //generate reCAPTCHA token
        grecaptcha.ready(function () {
            // do request for recaptcha token
            // response is promise with passed token
            grecaptcha
                .execute("6LcHrTkjAAAAABmHlk0bAoNpUpRE1Z--CGM91w8f", {
                    action: "validate_captcha",
                })
                .then(function (token) {
                    const data = {
                        email: String($scope.studentAdmission),
                        password: String($scope.studentPassword),
                        rememberMe: Boolean($scope.rememberMe),
                        token,
                    };

                    $http.post("/login", data).then((res) => {
                        $("#btn-studentLogin").html("Login").removeClass("disabled");
                        res.data.student
                            ? location.assign("/student")
                            : $scope.warningMsg("", res.data.err);
                    });
                });
        });
    };

    //forgot user password
    $scope.forgotUserPassword = () => {
        $("#btn-forgotPassword")
            .html(
                '<span class="spinner-border spinner-border-sm mr-2" role="status" aria-hidden="true"></span> Submitting...'
            )
            .addClass("disabled");
        const data = {
            email: String($scope.ruserEmail),
        };

        $http.post("/forgot/user/password", data).then((res) => {
            $("#btn-forgotPassword").html("Reset Password").removeClass("disabled");
            res.data.success
                ? $scope.successMsg("Success!", res.data.success)
                : $scope.warningMsg("", res.data.err);
        });
    };

    //forgot student password
    $scope.forgotStudentPassword = () => {
        $("#btn-forgotPassword")
            .html(
                '<span class="spinner-border spinner-border-sm mr-2" role="status" aria-hidden="true"></span> Submitting...'
            )
            .addClass("disabled");
        const data = {
            email: String($scope.rstudentEmail),
        };

        $http.post("/forgot/student/password", data).then((res) => {
            $("#btn-forgotPassword").html("Reset Password").removeClass("disabled");
            res.data.success
                ? $scope.successMsg("Success!", res.data.success)
                : $scope.warningMsg("", res.data.err);
        });
    };

    //reset password
    $scope.resetPassword = () => {
        $("#btn-resetPassword")
            .html(
                '<span class="spinner-border spinner-border-sm mr-2" role="status" aria-hidden="true"></span> Submitting...'
            )
            .addClass("disabled");

        const data = {
            newPassword: String($scope.newPassword),
        };

        $http.post(window.location.href, data).then((res) => {
            $("#btn-resetPassword").html("Submit").removeClass("disabled");
            res.data === "success"
                ? location.assign("/")
                : $scope.warningMsg("", res.data.err);
        });
    };

    //change password
    $scope.updatePassword = () => {
        $("#btn-updatePassword")
            .html(
                '<span class="spinner-border spinner-border-sm mr-2" role="status" aria-hidden="true"></span> Updating...'
            )
            .addClass("disabled");

        const data = {
            id: String($scope.userId),
            currentPassword: String($scope.currentPassword),
            newPassword: String($scope.newPassword),
        };

        $http.post("/update/password", data).then((res) => {
            res.data.success
                ? $scope.successMsg("Updated!", res.data.success)
                : $scope.warningMsg("", res.data.err);
        });
    };

    $scope.title = "Add";

    //save User
    $scope.saveUser = () => {
        $("#btn-saveUser")
            .html(
                '<span class="spinner-border spinner-border-sm mr-2" role="status" aria-hidden="true"></span> Saving...'
            )
            .addClass("disabled");
        const data = {
            title: String($scope.utitle),
            fname: String($scope.fname),
            lname: String($scope.lname),
            email: String($scope.email),
            gender: String($scope.gender),
            birthday: String($scope.birthday),
            phone: String($scope.phone),
            address: String($scope.address),
            category: String($scope.category),
        };

        if ($scope.title == "Add") {
            $http.post("/signup", data).then((res) => {
                $("#btn-saveUser").html("Submit").removeClass("disabled");
                if (res.data.success) {
                    $scope.fetchUsers();
                    $scope.utitle =
                        $scope.fname =
                        $scope.lname =
                        $scope.email =
                        $scope.gender =
                        $scope.birthday =
                        $scope.phone =
                        $scope.address =
                        $scope.category =
                        null;
                    $scope.successMsg("Success", res.data.success);
                } else {
                    $scope.errorMsg("", res.data.err);
                }
            });
        } else if ($scope.title == "Update") {
            $http.post(`/user/update/user/${$scope.id}`, data).then((res) => {
                $("#btn-saveUser").html("Submit").removeClass("disabled");
                if (res.data.success) {
                    $scope.fetchUsers();
                    $scope.title = "Add";
                    $scope.utitle =
                        $scope.fname =
                        $scope.lname =
                        $scope.email =
                        $scope.gender =
                        $scope.birthday =
                        $scope.phone =
                        $scope.address =
                        $scope.category =
                        null;
                    $scope.successMsg("Updated!", res.data.success);
                } else {
                    $scope.errorMsg("", re.err);
                }
            });
        }
    };

    //update user
    $scope.updateUser = (
        id,
        title,
        fname,
        lname,
        email,
        gender,
        birthday,
        phone,
        address,
        category
    ) => {
        $scope.id = id;
        $scope.utitle = title;
        $scope.fname = fname;
        $scope.lname = lname;
        $scope.email = email;

        $scope.gender = gender;
        $scope.birthday = birthday;
        $scope.phone = phone;
        $scope.address = address;
        $scope.category = category;
        $scope.title = "Update";

        $("#modalSignUp").modal("show");
    };

    //fetch users
    $scope.fetchUsers = () => {
        $http.get("/user/fetch/users").then((res) => {
            $scope.users = res.data;
            if (document.getElementById("users-table")) {
                document.getElementById("users-table").hidden = false;
            }
        });
    };

    //delete user
    $scope.deleteUser = (id) => {
        Swal.fire({
            title: "Are you sure?",
            text: "You won't be able to revert this!",
            icon: "warning",
            showCancelButton: true,
            confirmButtonText: "Yes, delete user!",
            customClass: {
                confirmButton: "btn bg-gradient-danger btn-lg mx-3",
                cancelButton: "btn bg-gradient-dark btn-lg mx-3",
            },
            buttonsStyling: false,
        }).then((result) => {
            if (result.isConfirmed) {
                $http.post(`/user/delete/user/${id}`).then((res) => {
                    if (res.data.success) {
                        $scope.fetchUsers();
                        $scope.successMsg("Deleted!", res.data.success);
                    } else {
                        $scope.errorMsg("", res.data.err);
                    }
                });
            }
        });
    };

    //save student
    $scope.saveStudent = () => {
        $("#btn-saveStudent")
            .html(
                '<span class="spinner-border spinner-border-sm mr-2" role="status" aria-hidden="true"></span> Saving...'
            )
            .addClass("disabled");
        const data = {
            fname: String($scope.fname),
            mname: String($scope.mname),
            lname: String($scope.lname),
            email: String($scope.email),
            gender: String($scope.gender),
            birthday: String($scope.birthday),
            phone: Number($scope.phone),
            address: String($scope.address),
            category: String($scope.category),
            course: String($scope.course),
        };

        if ($scope.title == "Add") {
            $http.post("/add/student", data).then((res) => {
                $("#btn-saveStudent").html("Submit").removeClass("disabled");
                if (res.data.success) {
                    $scope.fetchStudents();
                    $scope.fname =
                        $scope.mname =
                        $scope.lname =
                        $scope.email =
                        $scope.gender =
                        $scope.birthday =
                        $scope.phone =
                        $scope.address =
                        $scope.category =
                        $scope.course =
                        null;
                    $scope.successMsg("Success!", res.data.success);
                } else {
                    $scope.errorMsg("", res.data.err);
                }
            });
        } else if ($scope.title == "Update") {
            $http.post(`/user/update/student/${$scope.id}`, data).then((res) => {
                $("#btn-saveStudent").html("Submit").removeClass("disabled");
                if (res.data.success) {
                    $scope.fetchStudents();
                    $scope.title = "Add";
                    $scope.fname =
                        $scope.mname =
                        $scope.lname =
                        $scope.email =
                        $scope.gender =
                        $scope.birthday =
                        $scope.phone =
                        $scope.address =
                        $scope.category =
                        $scope.course =
                        null;
                    $scope.successMsg("Updated!", res.data.success);
                } else {
                    $scope.errorMsg("", res.data.err);
                }
            });
        }
    };

    //fetch students
    $scope.fetchStudents = () => {
        $http.get("/user/students/fetch").then((res) => {
            $scope.students = res.data;
            if (document.getElementById("students-table")) {
                document.getElementById("students-table").hidden = false;
            }
        });
    };

    //update student
    $scope.updateStudent = (
        id,
        fname,
        mname,
        lname,
        email,
        gender,
        birthday,
        phone,
        address,
        category,
        course
    ) => {
        $scope.id = id;
        $scope.fname = String(fname);
        $scope.mname = String(mname);
        $scope.lname = String(lname);
        $scope.email = String(email);
        $scope.gender = String(gender);
        $scope.birthday = birthday;
        $scope.phone = Number(phone);
        $scope.address = String(address);
        $scope.category = String(category);
        $scope.course = String(course);
        $scope.title = "Update";

        $("#modalStudent").modal("show");
    };

    //delete student
    $scope.deleteStudent = () => {
        const student = [];
        $('input[name="studentCheck"]:checkbox:checked').each(function (i) {
            student[i] = $(this).val();
        });
        if (student.length === 0) {
            $scope.promptMsg("", "Please select atleast one checkbox!");
            return false;
        }

        Swal.fire({
            title: "Are you sure?",
            text: "You won't be able to revert this!",
            icon: "warning",
            showCancelButton: true,
            confirmButtonText: "Yes, delete student(s)",
            customClass: {
                confirmButton: "btn bg-gradient-danger btn-lg mx-3",
                cancelButton: "btn bg-gradient-dark btn-lg mx-3",
            },
            buttonsStyling: false,
        }).then((result) => {
            if (result.isConfirmed) {
                $http.post("/user/delete/student", student).then((res) => {
                    if (res.data.success) {
                        $scope.fetchStudents();
                        $scope.successMsg("Deleted!", res.data.success);
                    } else {
                        $scope.errorMsg("", res.data.err);
                    }
                });
            }
        });
    };

    //add hall
    $scope.saveHall = () => {
        $("#btn-saveHall")
            .html(
                '<span class="spinner-border spinner-border-sm mr-2" role="status" aria-hidden="true"></span> Saving...'
            )
            .addClass("disabled");
        const data = {
            id: String($scope.id),
            name: String($scope.name),
            capacity: String($scope.capacity),
            faculty: String($scope.faculty),
        };
        if ($scope.title === "Add") {
            $http.post("/user/add/hall", data).then((res) => {
                $("#btn-saveHall").html("Submit").removeClass("disabled");
                if (res.data.success) {
                    $scope.fetchHall();
                    $scope.name = $scope.capacity = $scope.faculty = null;
                    $scope.successMsg("Success!", res.data.success);
                } else {
                    $scope.errorMsg("", res.data.err);
                }
            });
        } else if ($scope.title === "Update") {
            $http.post("/user/update/hall", data).then((res) => {
                $("#btn-saveHall").html("Submit").removeClass("disabled");
                if (res.data.success) {
                    $scope.fetchHall();
                    $scope.title = "Add";
                    $scope.name = $scope.capacity = $scope.faculty = null;
                    $scope.successMsg("Success!", res.data.success);
                } else {
                    $scope.errorMsg("", res.data.err);
                }
            });
        }
    };

    //update hall
    $scope.updateHall = (id, name, capacity, faculty) => {
        $scope.id = id;
        $scope.name = String(name);
        $scope.capacity = Number(capacity);
        $scope.faculty = String(faculty);
        $scope.title = "Update";

        $("#modalHall").modal("show");
    };

    //delete hall
    $scope.deleteHall = () => {
        const hall = [];
        $('input[name="hallCheck"]:checkbox:checked').each(function (i) {
            hall[i] = $(this).val();
        });
        if (hall.length === 0) {
            $scope.promptMsg("", "Please select atleast one checkbox!");
            return false;
        }

        Swal.fire({
            title: "Are you sure?",
            text: "You won't be able to revert this!",
            icon: "warning",
            showCancelButton: true,
            confirmButtonText: "Yes, delete hall(s)",
            customClass: {
                confirmButton: "btn bg-gradient-danger btn-lg mx-3",
                cancelButton: "btn bg-gradient-dark btn-lg mx-3",
            },
            buttonsStyling: false,
        }).then((result) => {
            if (result.isConfirmed) {
                $http.post("/user/delete/hall", hall).then((res) => {
                    if (res.data.success) {
                        $scope.fetchHall();
                        $scope.successMsg("Deleted!", res.data.success);
                    } else {
                        $scope.errorMsg("", res.data.err);
                    }
                });
            }
        });
    };

    //fetch faculty
    $scope.fetchHall = () => {
        $http.get("/user/fetch/hall").then((res) => {
            $scope.halls = res.data;
        });
    };

    //add faculty
    $scope.saveFaculty = () => {
        $("#btn-saveFaculty")
            .html(
                '<span class="spinner-border spinner-border-sm mr-2" role="status" aria-hidden="true"></span> Saving...'
            )
            .addClass("disabled");
        const data = {
            code: String($scope.code),
            name: String($scope.name),
            description: String($scope.description),
        };
        $http.post("/user/add/faculty", data).then((res) => {
            $("#btn-saveFaculty").html("Submit").removeClass("disabled");
            if (res.data.success) {
                $scope.fetchFaculty();
                $scope.code = $scope.name = $scope.description = null;
                $scope.successMsg("Success!", res.data.success);
            } else {
                $scope.errorMsg("", res.data.err);
            }
        });
    };

    //fetch faculty
    $scope.fetchFaculty = () => {
        $http.get("/user/fetch/faculty").then((res) => {
            $scope.faculties = res.data;
        });
    };

    //fetch courses
    $scope.fetchCourses = () => {
        $http.get("/user/fetch/courses").then((res) => {
            $scope.courses = res.data;
            if (document.getElementById("courses-table")) {
                document.getElementById("courses-table").hidden = false;
            }
        });
    };

    //save course
    $scope.saveCourse = () => {
        $("#btn-saveCourse")
            .html(
                '<span class="spinner-border spinner-border-sm mr-2" role="status" aria-hidden="true"></span> Saving...'
            )
            .addClass("disabled");
        const data = {
            code: String($scope.code),
            name: String($scope.name),
            description: String($scope.description),
            type: String($scope.type),
            faculty: String($scope.faculty),
            status: String($scope.status),
        };

        if ($scope.title == "Add") {
            $http.post("/user/add/course", data).then((res) => {
                $("#btn-saveCourse").html("Submit").removeClass("disabled");
                if (res.data.success) {
                    $scope.fetchCourses();
                    $scope.code =
                        $scope.name =
                        $scope.description =
                        $scope.type =
                        $scope.faculty =
                        $scope.status =
                        null;
                    $scope.successMsg("Success!", res.data.success);
                } else {
                    $scope.errorMsg("", res.data.err);
                }
            });
        } else if ($scope.title == "Update") {
            $http.post(`/user/update/course/${$scope.id}`, data).then((res) => {
                $("#btn-saveCourse").html("Submit").removeClass("disabled");
                if (res.data.success) {
                    $scope.title = "Add";
                    $scope.fetchCourses();
                    $scope.code =
                        $scope.name =
                        $scope.description =
                        $scope.type =
                        $scope.faculty =
                        $scope.status =
                        null;
                    $scope.successMsg("Updated!", res.data.success);
                } else {
                    $scope.errorMsg("", res.data.err);
                }
            });
        }
    };

    //about course
    $scope.aboutCourse = (id, code, name, description, type, faculty) => {
        $scope.id = id;
        $scope.code = code;
        $scope.name = name;
        $scope.description = description;
        $scope.type = type;
        $scope.faculty = faculty;

        const users = $scope.units.filter((el) => {
            return el.courses._id == id;
        });

        let facultyLec = [];

        for (let i = 0; i < users.length; i++) {
            const fname = users[i].users.fname;
            const lname = users[i].users.lname;
            const title = users[i].users.title;
            const user = `${title}. ${fname} ${lname}`;
            facultyLec.push(user);
        }

        $scope.facultyLec = [...new Set(facultyLec.map((item) => item))];
        $("#modalAboutCourse").modal("show");
    };

    //update course
    $scope.updateCourse = (
        id,
        code,
        name,
        description,
        type,
        faculty,
        status
    ) => {
        $scope.id = String(id);
        $scope.code = String(code);
        $scope.name = String(name);
        $scope.description = String(description);
        $scope.type = String(type);
        $scope.faculty = String(faculty);
        $scope.status = Boolean(status);
        $scope.title = "Update";

        $("#modalCourse").modal("show");
    };

    //delete course
    $scope.deleteCourse = () => {
        const course = [];
        $('input[name="courseCheck"]:checkbox:checked').each(function (i) {
            course[i] = $(this).val();
        });
        if (course.length === 0) {
            $scope.promptMsg("", "Pleae select atleast one checkbox!");
            return false;
        }

        Swal.fire({
            title: "Are you sure?",
            text: "You won't be able to revert this!",
            icon: "warning",
            showCancelButton: true,
            confirmButtonText: "Yes, delete course(s)",
            customClass: {
                confirmButton: "btn bg-gradient-danger btn-lg mx-3",
                cancelButton: "btn bg-gradient-dark btn-lg mx-3",
            },
            buttonsStyling: false,
        }).then((result) => {
            if (result.isConfirmed) {
                $http.post("/user/delete/course", course).then((res) => {
                    if (res.data.success) {
                        $scope.fetchCourses();
                        $scope.successMsg("Deleted!", res.data.success);
                    } else {
                        $scope.errorMsg("", res.data.err);
                    }
                });
            }
        });
    };

    //fetch units
    $scope.fetchUnits = () => {
        $http.get("/fetch/units").then((res) => {
            $scope.units = res.data;
            if (document.getElementById("units-table")) {
                document.getElementById("units-table").hidden = false;
            }
        });
    };

    //save student
    $scope.saveUnit = () => {
        $("#btn-saveUnit")
            .html(
                '<span class="spinner-border spinner-border-sm mr-2" role="status" aria-hidden="true"></span> Saving...'
            )
            .addClass("disabled");
        const data = {
            code: String($scope.code),
            name: String($scope.name),
            course: String($scope.course),
            session: String($scope.session),
            lecturer: String($scope.lecturer),
            status: Boolean($scope.status),
        };

        if ($scope.title == "Add") {
            $http.post("/user/add/unit", data).then((res) => {
                $("#btn-saveUnit").html("Submit").removeClass("disabled");
                if (res.data.success) {
                    $scope.fetchUnits();
                    $scope.code =
                        $scope.name =
                        $scope.course =
                        $scope.session =
                        $scope.lecturer =
                        $scope.status =
                        null;
                    $scope.successMsg("Success!", res.data.success);
                } else {
                    $scope.errorMsg("", res.data.err);
                }
            });
        } else if ($scope.title == "Update") {
            $http.post(`/user/update/unit/${$scope.id}`, data).then((res) => {
                $("#btn-saveUnit").html("Submit").removeClass("disabled");
                if (res.data.success) {
                    $scope.fetchUnits();
                    $scope.fetchOfferedUnits();
                    $scope.title = "Add";
                    $scope.code =
                        $scope.name =
                        $scope.course =
                        $scope.session =
                        $scope.lecturer =
                        $scope.status =
                        null;
                    $scope.successMsg("Updated!", res.data.success);
                } else {
                    $scope.errorMsg("", res.data.err);
                }
            });
        }
    };

    //update unit
    $scope.updateUnit = (id, code, name, course, session, lecturer, status) => {
        $scope.id = id;
        $scope.code = code;
        $scope.name = name;
        $scope.course = course;
        $scope.session = session;
        $scope.lecturer = lecturer;
        $scope.status = status;
        $scope.title = "Update";

        $("#modalUnit").modal("show");
    };

    //delete units
    $scope.deleteUnits = () => {
        const unit = [];
        $('input[name="unitCheck"]:checkbox:checked').each(function (i) {
            unit[i] = $(this).val();
        });
        if (unit.length === 0) {
            $scope.promptMsg("", "Please select atleast one checkbox!");
            return false;
        }

        Swal.fire({
            title: "Are you sure?",
            text: "You won't be able to revert this!",
            icon: "warning",
            showCancelButton: true,
            confirmButtonText: "Yes, delete unit(s)",
            customClass: {
                confirmButton: "btn bg-gradient-danger btn-lg mx-3",
                cancelButton: "btn bg-gradient-dark btn-lg mx-3",
            },
            buttonsStyling: false,
        }).then((result) => {
            if (result.isConfirmed) {
                $http.post("/user/delete/unit", unit).then((res) => {
                    if (res.data.success) {
                        $scope.fetchUnits();
                        $scope.successMsg("Deleted!", res.data.success);
                    } else {
                        $scope.errorMsg("", res.data.err);
                    }
                });
            }
        });
    };

    $scope.addPeriod = () => {
        const data = { name: String($scope.period) };
        $http.post("/user/add/period", data).then((res) => {
            if (res.data.success) {
                $scope.fetchPeriod();
                $scope.successMsg("Success!", res.data.success);
            } else {
                $scope.errorMsg("", res.data.err);
            }
        });
    };

    //fetch periods
    $scope.fetchPeriod = () => {
        $http.get("/user/fetch/period").then((res) => {
            $scope.periods = res.data;
            $scope.period = res.data[0].name;
        });
    };

    //apply selected units
    $scope.applySelectedUnits = () => {
        const period = $scope.period;
        const unit = [];
        $('input[name="unitCheck"]:checkbox:checked').each(function (i) {
            unit[i] = $(this).val();
        });
        if (unit.length === 0) {
            $scope.promptMsg("", "Please select atleast one checkbox!");
            return false;
        }

        const data = { period, units: unit };

        Swal.fire({
            title: "Are you sure?",
            text: `The selected units will be applied on offer for the current period ${$scope.period}.`,
            icon: "warning",
            showCancelButton: true,
            confirmButtonText: "Yes, continue",
            customClass: {
                confirmButton: "btn bg-gradient-primary btn-lg mx-3",
                cancelButton: "btn bg-gradient-dark btn-lg mx-3",
            },
            buttonsStyling: false,
        }).then((result) => {
            if (result.isConfirmed) {
                $("#btn-applySelectedUnits")
                    .html(
                        '<span class="spinner-border spinner-border-sm mr-2" role="status" aria-hidden="true"></span> Applying...'
                    )
                    .addClass("disabled");
                $http.post("/user/apply/unit", data).then((res) => {
                    $("#btn-applySelectedUnits")
                        .html("Apply Selected")
                        .removeClass("disabled");
                    if (res.data.success) {
                        $scope.fetchOfferedUnits();
                        $scope.successMsg("Applied!", res.data.success);
                    } else {
                        $scope.errorMsg("", res.data.err);
                    }
                });
            }
        });
    };

    //fetch offered units
    $scope.fetchOfferedUnits = () => {
        $http.get("/fetch/offered/units").then((res) => {
            $scope.offeredUnits = res.data;
            if (document.getElementById("offered-units-table")) {
                document.getElementById("offered-units-table").hidden = false;
            }
        });
    };

    //remove offered units
    $scope.removeOfferedUnit = () => {
        const unit = [];
        $('input[name="unitOfferedCheck"]:checkbox:checked').each(function (i) {
            unit[i] = $(this).val();
        });
        if (unit.length === 0) {
            $scope.promptMsg("", "Please select atleast one checkbox!");
            return false;
        }

        Swal.fire({
            title: "Are you sure?",
            text: "You won't be able to revert this!",
            icon: "warning",
            showCancelButton: true,
            confirmButtonText: "Yes, remove unit(s)",
            customClass: {
                confirmButton: "btn bg-gradient-danger btn-lg mx-3",
                cancelButton: "btn bg-gradient-dark btn-lg mx-3",
            },
            buttonsStyling: false,
        }).then((result) => {
            if (result.isConfirmed) {
                $http.post("/remove/offered/units", unit).then((res) => {
                    if (res.data.success) {
                        $scope.fetchOfferedUnits();
                        $scope.successMsg("Removed!", res.data.success);
                    } else {
                        $scope.errorMsg("", res.data.err);
                    }
                });
            }
        });
    };

    //attendance records
    $scope.fetchAttendanceRecords = () => {
        $http.get(`/attendance/records`).then((res) => {
            $scope.attendance = res.data;
            if (document.getElementById("attendance-table")) {
                document.getElementById("attendance-table").hidden = false;
            }
        });
    };

    //delete attendance
    $scope.deleteAttendance = () => {
        const attendance = [];
        $('input[name="attendanceCheck"]:checkbox:checked').each(function (i) {
            attendance[i] = $(this).val();
        });
        if (attendance.length === 0) {
            $scope.promptMsg("", "Please select atleast one checkbox!");
            return false;
        }

        Swal.fire({
            title: "Are you sure?",
            text: "You won't be able to revert this!",
            icon: "warning",
            showCancelButton: true,
            confirmButtonText: "Yes, delete record(s)",
            customClass: {
                confirmButton: "btn bg-gradient-danger btn-lg mx-3",
                cancelButton: "btn bg-gradient-dark btn-lg mx-3",
            },
            buttonsStyling: false,
        }).then((result) => {
            if (result.isConfirmed) {
                $http.post("/delete/attendance", { attendance }).then((res) => {
                    if (res.data.success) {
                        $scope.fetchAttendanceRecords();
                        $scope.successMsg("Deleted!", res.data.success);
                    } else {
                        $scope.errorMsg("", res.data.err);
                    }
                });
            }
        });
    };

    //unit attendace details
    $scope.fetchUnitAttendance = (id, code, unit, date) => {
        $scope.unitName = unit;
        $scope.unitCode = code;
        $scope.attendanceDate = date;

        $http.post(`/unit/attendance/${id}`).then((res) => {
            $scope.unitAttendance = res.data;
            $("#modalUnitAttendance").modal("show");
        });
    };

    //attendance details
    $scope.fetchAttendanceDetails = () => {
        $http.get(`/attendance/details`).then((res) => {
            $scope.attendanceDetails = res.data;
        });
    };

    //unit attendance history
    $scope.unitAttendanceHistory = (id, code, unit, period) => {
        $scope.unitName = unit;
        $scope.unitCode = code;
        $scope.unitPeriod = period;

        let result = $scope.attendanceDetails
            .filter((el) => {
                return el.offeredunits._id == id;
            })
            .reverse();

        let dates = [];
        for (let i = 0; i < result.length; i++) {
            const date = new Date(`${result[i].attendancerecords.createdAt}`);
            const timestamp = `${date.getFullYear()}-${(
                "0" +
                (date.getMonth() + 1)
            ).slice(-2)}-${("0" + date.getDate()).slice(-2)}`;
            dates.push(timestamp);
        }

        $scope.dates = [...new Set(dates.map((item) => item))];

        let studentIds = [...new Set(result.map((item) => item.students._id))];

        let students = [];
        for (let i = 0; i < studentIds.length; i++) {
            let student = result.filter((el) => {
                return el.students._id == studentIds[i];
            });
            students.push(student);
        }

        $scope.stds = students;
        $("#modalUnitAttendanceHistory").modal("show");
    };

    //attendance qrcode
    $scope.attendanceQRCode = (id, code, name) => {
        document.getElementById("QRSpinner").hidden = false;
        document.getElementById("QRCode").hidden = true;
        $scope.unitCode = code;
        $scope.unitName = name;

        const data = { unit: id, period: $scope.period };

        $http.post("/attendance/qrcode", data).then((res) => {
            $scope.QRCodeURL = res.data;
            document.getElementById("QRSpinner").hidden = true;
            document.getElementById("QRCode").hidden = false;
            $scope.fetchAttendanceDetails();
            $("#modalAttendanceQRCode").modal("show");
        });
    };

    //attendance qrcode scanner
    const qrcode = window.qrcode;
    const video = document.createElement("video");

    let scanning = false;

    $scope.attendanceQRCodeScanner = (id, code, name) => {
        $scope.unitId = id;
        $scope.unitCode = code;
        $scope.unitName = name;

        const constraints = {
            audio: false,
            video: true,
        };

        navigator.mediaDevices
            .getUserMedia({ video: { facingMode: "environment" }, audio: false })
            .then((stream) => {
                scanning = true;
                const videoTracks = stream.getVideoTracks();
                console.log("Got stream with constraints:", constraints);
                console.log(`Using video device: ${videoTracks[0].label}`);
                stream.onremovetrack = () => {
                    console.log("Stream ended");
                };

                video.setAttribute("playsinline", true); // required to tell iOS safari we don't want fullscreen
                video.srcObject = stream;
                video.play();
                tick();
                scan();

                $("#modalAttendanceQRCodeScanner").modal("show");

                qrcode.callback = (res) => {
                    if (res) {
                        scanning = false;

                        const data = {
                            student: $scope.userId,
                            unit: $scope.unitId,
                            code: res,
                        };

                        video.srcObject.getTracks().forEach((track) => {
                            track.stop();

                            try {
                                $http.post("/attendance/qrscanner", data).then((res) => {
                                    $("#modalAttendanceQRCodeScanner").modal("hide");
                                    if (res.data.success) {
                                        $scope.successMsg("Verified!", res.data.success);
                                    } else {
                                        $scope.errorMsg("Verification Failed!", res.data.err);
                                    }
                                    $scope.fetchAttendanceDetails();
                                });
                            } catch (error) {
                                $scope.errorMsg("Verification Failed!", error.message);
                            }
                        });
                    }
                };
            })
            .catch((error) => {
                if (error.name === "ConstraintNotSatisfiedError") {
                    console.error(
                        `The resolution ${constraints.video.width.exact}x${constraints.video.height.exact} px is not supported by your device.`
                    );
                    $scope.errorMsg(
                        "ConstraintNotSatisfiedError",
                        `The resolution ${constraints.video.width.exact}x${constraints.video.height.exact} px is not supported by your device.`
                    );
                } else if (error.name === "PermissionDeniedError") {
                    console.error(
                        "Permissions have not been granted to use your camera " +
                        ", you need to allow the page access to your devices in " +
                        "order to scan."
                    );
                    $scope.errorMsg(
                        "PermissionDeniedError",
                        "Permissions have not been granted to use your camera " +
                        ", you need to allow the page access to your devices in " +
                        "order to scan."
                    );
                } else {
                    console.error(`getUserMedia error: ${error.name}`, error);
                    $scope.errorMsg("getUserMedia error", error);
                }
            });
    };

    function tick() {
        const canvasElement = document.getElementById("qr-canvas");
        const canvas = canvasElement.getContext("2d");

        canvasElement.height = 260;
        canvasElement.width = 260;
        canvas.drawImage(video, 0, 0, canvasElement.width, canvasElement.height);

        scanning && requestAnimationFrame(tick);
    }

    function scan() {
        try {
            qrcode.decode();
        } catch (e) {
            setTimeout(scan, 900);
        }
    }

    //modal on hide
    $("#modalAttendanceQRCodeScanner").on("hide.bs.modal", () => {
        scanning = false;
        video.srcObject.getTracks().forEach((track) => {
            track.stop();
        });
    });

    //student attendance history
    $scope.attendanceHistoryStudent = (id, code, name) => {
        $scope.unitId = id;
        $scope.unitCode = code;
        $scope.unitName = name;

        const present = $scope.attendanceDetails.filter((el) => {
            return (
                el.offeredunits._id == id &&
                el.students._id == $scope.userId &&
                el.attendancedetails.status == 1
            );
        }).length;

        const absent = $scope.attendanceDetails.filter((el) => {
            return (
                el.offeredunits._id == id &&
                el.students._id == $scope.userId &&
                el.attendancedetails.status == 0
            );
        }).length;

        const ctx1 = document.getElementById("chart-pie").getContext("2d");

        // Pie chart
        $scope.chart = new Chart(ctx1, {
            type: "pie",
            data: {
                labels: ["Present", "Absent"],
                datasets: [
                    {
                        label: "Attendance",
                        weight: 9,
                        cutout: 0,
                        tension: 0.9,
                        pointRadius: 2,
                        borderWidth: 2,
                        backgroundColor: ["#17c1e8", "#3A416F"],
                        data: [present, absent],
                    },
                ],
            },
            options: {
                responsive: true,
                plugins: {
                    legend: {
                        display: false,
                    },
                },
                interaction: {
                    intersect: false,
                    mode: "index",
                },
            },
        });

        $("#modalAttendanceHistory").modal("show");
    };

    //student attendance history
    $scope.studentUnitAttendanceHistory = (id, stdId, code, name) => {
        $scope.unitId = id;
        $scope.studentId = stdId;
        $scope.studentCode = code;
        $scope.studentName = name;

        const present = $scope.attendanceDetails.filter((el) => {
            return (
                el.offeredunits._id == id &&
                el.students._id == stdId &&
                el.attendancedetails.status == 1
            );
        }).length;

        const absent = $scope.attendanceDetails.filter((el) => {
            return (
                el.offeredunits._id == id &&
                el.students._id == stdId &&
                el.attendancedetails.status == 0
            );
        }).length;

        const ctx1 = document.getElementById("chart-pie").getContext("2d");

        // Pie chart
        $scope.chart = new Chart(ctx1, {
            type: "pie",
            data: {
                labels: ["Present", "Absent"],
                datasets: [
                    {
                        label: "Attendance",
                        weight: 9,
                        cutout: 0,
                        tension: 0.9,
                        pointRadius: 2,
                        borderWidth: 2,
                        backgroundColor: ["#17c1e8", "#3A416F"],
                        data: [present, absent],
                    },
                ],
            },
            options: {
                responsive: true,
                plugins: {
                    legend: {
                        display: false,
                    },
                },
                interaction: {
                    intersect: false,
                    mode: "index",
                },
            },
        });

        $("#modalAttendanceHistory").modal("show");
    };

    //modal on hide
    $("#modalAttendanceHistory").on("hide.bs.modal", function () {
        $scope.chart.destroy();
    });

    //reg semeter
    $scope.regSemester = () => {
        const data = {
            session: String($scope.session),
            period: String($scope.period),
            hostel: Boolean($scope.hostel),
            student: $scope.userId,
            course: $scope.studentCourse,
        };

        Swal.fire({
            title: "Are you sure?",
            text: `You will be registered for the current semester period ${$scope.period}.`,
            icon: "warning",
            showCancelButton: true,
            confirmButtonText: "Yes, register semester",
            customClass: {
                confirmButton: "btn bg-gradient-primary btn-lg mx-3",
                cancelButton: "btn bg-gradient-dark btn-lg mx-3",
            },
            buttonsStyling: false,
        }).then((result) => {
            if (result.isConfirmed) {
                $("#btn-regSemester")
                    .html(
                        '<span class="spinner-border spinner-border-sm mr-2" role="status" aria-hidden="true"></span> Registering...'
                    )
                    .addClass("disabled");
                $http.post("/student/reg/semester", data).then((res) => {
                    $("#btn-regSemester").html("Submit").removeClass("disabled");
                    if (res.data.success) {
                        $scope.fetchSemester();
                        $scope.session = $scope.hostel = null;
                        $("#modalRegSemester").modal("hide");
                        $scope.successMsg("Registered!", res.data.success);
                    } else {
                        $scope.errorMsg("", res.data.err);
                    }
                });
            }
        });
    };

    //fetch semester
    $scope.fetchSemester = () => {
        $http.get(`/student/semester/fetch/${$scope.userId}`).then((res) => {
            $scope.semesters = res.data;
        });
    };

    //reg student units
    $scope.regCourseUnits = () => {
        const unit = [];
        $('input[name="unitRegCheck"]:checkbox:checked').each(function (i) {
            unit[i] = $(this).val();
        });

        if (unit.length === 0) {
            $scope.promptMsg("", "Please select atleast one checkbox!");
            return false;
        }

        if (unit.length > 8) {
            $scope.promptMsg("", "You can only select a maximum of 8 units!");
            return false;
        }

        const data = {
            units: unit,
            period: $scope.period,
            student: $scope.userId,
        };

        Swal.fire({
            title: "Are you sure?",
            text: `The selected units will be registered for the current semester period ${$scope.period}.`,
            icon: "warning",
            showCancelButton: true,
            confirmButtonText: "Yes, register unit(s)",
            customClass: {
                confirmButton: "btn bg-gradient-primary btn-lg mx-3",
                cancelButton: "btn bg-gradient-dark btn-lg mx-3",
            },
            buttonsStyling: false,
        }).then((result) => {
            if (result.isConfirmed) {
                $("#btn-regUnits")
                    .html(
                        '<span class="spinner-border spinner-border-sm mr-2" role="status" aria-hidden="true"></span> Applying...'
                    )
                    .addClass("disabled");
                $http.post("/student/reg/units", data).then((res) => {
                    $("#btn-regUnits").html("Apply selected").removeClass("disabled");
                    if (res.data.success) {
                        $scope.fetchRegUnits();
                        $scope.successMsg("Registered!", res.data.success);
                    } else {
                        $scope.errorMsg("", res.data.err);
                    }
                });
            }
        });
    };

    //fetch student registered units
    $scope.fetchRegUnits = () => {
        $http.post(`/student/fetch/reg/units/${$scope.userId}`).then((res) => {
            $scope.regUnits = res.data;
            if (document.getElementById("reg-units-table")) {
                document.getElementById("reg-units-table").hidden = false;
            }
        });
    };

    //remove registered unit
    $scope.removeRegUnit = () => {
        const unit = [];
        $('input[name="unitRegedCheck"]:checkbox:checked').each(function (i) {
            unit[i] = $(this).val();
        });
        if (unit.length === 0) {
            $scope.promptMsg("", "Please select atleast one checkbox!");
            return false;
        }

        Swal.fire({
            title: "Are you sure?",
            text: "You won't be able to revert this!",
            icon: "warning",
            showCancelButton: true,
            confirmButtonText: "Yes, remove unit(s)",
            customClass: {
                confirmButton: "btn bg-gradient-danger btn-lg mx-3",
                cancelButton: "btn bg-gradient-dark btn-lg mx-3",
            },
            buttonsStyling: false,
        }).then((result) => {
            if (result.isConfirmed) {
                $("#btn-removeRegUnit")
                    .html(
                        '<span class="spinner-border spinner-border-sm mr-2" role="status" aria-hidden="true"></span> Removing...'
                    )
                    .addClass("disabled");
                $http.post("/student/remove/reg/unit", { units: unit }).then((res) => {
                    $("#btn-removeRegUnit")
                        .html("Remove Selected")
                        .removeClass("disabled");
                    if (res.data.success) {
                        $scope.fetchRegUnits();
                        $scope.successMsg("Removed!", res.data.success);
                    } else {
                        $scope.errorMsg("", res.data.err);
                    }
                });
            }
        });
    };

    //generate timetable
    $scope.generateTimetable = () => {
        Swal.fire({
            title: "Are you sure?",
            text: `You about to generate timetable for the course units in the current period ${$scope.period}. Please be patient for it might take a while to generate the timetable.`,
            icon: "warning",
            showCancelButton: true,
            confirmButtonText: "Yes, Generate Timetable",
            customClass: {
                confirmButton: "btn bg-gradient-danger btn-lg mx-3",
                cancelButton: "btn bg-gradient-dark btn-lg mx-3",
            },
            buttonsStyling: false,
        }).then((result) => {
            if (result.isConfirmed) {
                $("#btn-generateTimetable")
                    .html(
                        '<span class="spinner-border spinner-border-sm mr-2" role="status" aria-hidden="true"></span> Generating...'
                    )
                    .addClass("disabled");
                let units = [];
                const result = $scope.offeredUnits
                    .filter((el) => {
                        return el.offeredunits.period == $scope.period;
                    })
                    .sort(() => Math.random() - 0.5);

                for (let i = 0; i < result.length; i++) {
                    const unit = result[i].offeredunits._id;
                    const lecturer = result[i].units.lecturer;
                    const course = result[i].courses._id;
                    const faculty = result[i].courses.faculty;
                    const session = result[i].units.session;
                    const students = result[i].offeredunits.students;

                    const data = { unit, lecturer, course, faculty, session, students };
                    units.push(data);
                }

                $http.post("/user/generate/timetable", { units }).then((res) => {
                    $("#btn-generateTimetable")
                        .html("Generate Timetable")
                        .removeClass("disabled");
                    if (res.data.success) {
                        $scope.fetchTimetable();
                        $scope.successMsg("Generated!", res.data.success);
                    } else {
                        $scope.errorMsg("", res.data.err);
                    }
                });
            }
        });
    };

    //delete timetable
    $scope.deleteTimetable = () => {
        Swal.fire({
            title: "Are you sure?",
            text: `You about to delete timetable for the course units in the current period ${$scope.period}`,
            icon: "warning",
            showCancelButton: true,
            confirmButtonText: "Yes, Delete Timetable",
            customClass: {
                confirmButton: "btn bg-gradient-danger btn-lg mx-3",
                cancelButton: "btn bg-gradient-dark btn-lg mx-3",
            },
            buttonsStyling: false,
        }).then((result) => {
            if (result.isConfirmed) {
                $http.post("/user/delete/timetable").then((res) => {
                    if (res.data.success) {
                        $scope.fetchTimetable();
                        $scope.successMsg("Removed!", res.data.success);
                    } else {
                        $scope.errorMsg("", res.data.err);
                    }
                });
            }
        });
    };

    //fetch timetable
    $scope.fetchTimetable = () => {
        $http.get("/user/fetch/timetable").then((res) => {
            $scope.timetable = res.data;
            if (document.getElementById("timetable")) {
                document.getElementById("timetable").hidden = false;
            }
        });
    };

    //add structure
    $scope.saveStructure = () => {
        $("#btn-saveStructure")
            .html(
                '<span class="spinner-border spinner-border-sm mr-2" role="status" aria-hidden="true"></span> Saving...'
            )
            .addClass("disabled");
        const data = {
            course: String($scope.course),
            session: String($scope.session),
            academics: Number($scope.academics),
            accomodation: Number($scope.accomodation),
        };

        if ($scope.title === "Add") {
            $http.post("/user/add/structure", data).then((res) => {
                $("#btn-saveStructure").html("Submit").removeClass("disabled");
                if (res.data.success) {
                    $scope.fetchStructure();
                    $scope.course =
                        $scope.session =
                        $scope.academics =
                        $scope.accomodation =
                        null;
                    $scope.successMsg("Success!", res.data.success);
                } else {
                    $scope.errorMsg("", res.data.err);
                }
            });
        } else if ($scope.title === "Update") {
            $http.post(`/user/update/structure/${$scope.id}`, data).then((res) => {
                $("#btn-saveStructure").html("Submit").removeClass("disabled");
                if (res.data.success) {
                    $scope.title = "Add";
                    $scope.fetchStructure();
                    $scope.course =
                        $scope.session =
                        $scope.academics =
                        $scope.accomodation =
                        null;
                    $scope.successMsg("Updated!", res.data.success);
                } else {
                    $scope.errorMsg("", re.err);
                }
            });
        }
    };

    //update fee structure
    $scope.updateStructure = (id, course, session, academics, accomodation) => {
        $scope.id = id;
        $scope.course = course;
        $scope.session = session;
        $scope.academics = academics;
        $scope.accomodation = accomodation;
        $scope.title = "Update";

        $("#modalStructure").modal("show");
    };

    //delete structure
    $scope.deleteStructure = () => {
        const structure = [];
        $('input[name="structureCheck"]:checkbox:checked').each(function (i) {
            structure[i] = $(this).val();
        });
        if (structure.length === 0) {
            $scope.promptMsg("", "Please select atleast one checkbox!");
            return false;
        }

        Swal.fire({
            title: "Are you sure?",
            text: "You won't be able to revert this!",
            icon: "warning",
            showCancelButton: true,
            confirmButtonText: "Yes, delete!",
            customClass: {
                confirmButton: "btn bg-gradient-danger btn-lg mx-3",
                cancelButton: "btn bg-gradient-dark btn-lg mx-3",
            },
            buttonsStyling: false,
        }).then((result) => {
            if (result.isConfirmed) {
                $http.post(`/user/delete/structure`, structure).then((res) => {
                    if (res.data.success) {
                        $scope.fetchStructure();
                        $scope.successMsg("Deleted!", res.data.success);
                    } else {
                        $scope.errorMsg("", res.data.err);
                    }
                });
            }
        });
    };

    //fetch structure
    $scope.fetchStructure = () => {
        $http.get("/user/fetch/structure").then((res) => {
            $scope.structure = res.data;
            if (document.getElementById("structure-table")) {
                document.getElementById("structure-table").hidden = false;
            }
        });
    };

    //fetch statements
    $scope.fetchFeeStatements = () => {
        $http.get(`/student/fetch/fee/statements/${$scope.userId}`).then((res) => {
            $scope.feeStatements = res.data;
            $scope.currentSemFeeStatement = res.data[0];
            if (document.getElementById("fee-statements-table")) {
                document.getElementById("fee-statements-table").hidden = false;
            }
        });
    };

    //fetch accomodation statements
    $scope.fetchAccomodationStatements = () => {
        $http
            .get(`/student/fetch/accomodation/statements/${$scope.userId}`)
            .then((res) => {
                $scope.accomodationStatements = res.data;
                if (document.getElementById("accomodation-statements-table")) {
                    document.getElementById(
                        "accomodation-statements-table"
                    ).hidden = false;
                }
            });
    };

    window.addEventListener("load", function () {
        if ($scope.userId) {
            $scope.fetchCourses();
            $scope.fetchUnits();
            $scope.fetchPeriod();
            $scope.fetchOfferedUnits();
            $scope.fetchAttendanceDetails();

            if (window.location.href.indexOf("/user") > -1) {
                $scope.fetchUsers();
                $scope.fetchStudents();
                $scope.fetchHall();
                $scope.fetchFaculty();
                $scope.fetchAttendanceRecords();
                $scope.fetchTimetable();
                $scope.fetchStructure();
            }

            if (window.location.href.indexOf("/student") > -1) {
                $scope.fetchSemester();
                $scope.fetchRegUnits();
                $scope.fetchFeeStatements();
                $scope.fetchAccomodationStatements();
            }
        }
    });
});
