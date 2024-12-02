"use strict";

class frontendProduct {
    static renderReviews(data) {
        let reviewScopeHtml = "";
        if (Array.isArray(data) && data.length) {
            data.forEach((value) => {
                const score = parseInt(value.score);
                let rateStarHtml = "";
                let reviewTextHtml = "";
                let channelHtml = "";
                let amountHtml = "";
                for (let i = 0; i < score; i++) {
                    rateStarHtml = `
                        ${rateStarHtml}
                        <i class="fa fa-fw fa-star text-warning"></i>
                    `;
                }
                if (value.text) {
                    reviewTextHtml = `<p class="fs-normal mt-2 pt-2 border-top mb-0">${value.text}</p>`;
                }
                if (value.channel_name) {
                    channelHtml = `
                        <span class="fs-sm">
                            <span class="text-muted">Payment Method: </span>${value.channel_name}
                        </span>
                    `;
                }
                if (value.channel_name) {
                    amountHtml = `
                        <span class="fs-sm">
                            <span class="text-muted">Total: </span>${value.currency_code} ${value.total_amount}
                        </span>
                    `;
                }
                reviewScopeHtml = `
                    ${reviewScopeHtml}
                    <div class="d-flex flex-column rounded rounded-3 mb-3 px-3 py-2 border-bottom border-3 bg-body-light">
                        <span class="fs-sm fw-semibold">${value.email}</span>
                        <div class="d-flex align-items-center mb-2">
                            <div class="fs-xs align-self-center me-1">${rateStarHtml}</div>
                            <p class="text-muted mb-0 fs-xs"> &bull; ${value.time_ago}</p>
                        </div>
                        <span class="fs-sm"><span class="text-muted">Item: </span>${value.denomination_name}</span>
                        ${channelHtml}
                        ${amountHtml}
                        ${reviewTextHtml}
                    </div>
                `;
            });
        }
        $("#review-scope-list").html(reviewScopeHtml);
    }

    static loadReviews(page = 1) {
        const countryCode = $('meta[name="x-country-code"]').attr("content");
        const productCode = $('meta[name="product-code"]').attr("content");
        const filter = $('input[name="reviewFilter"]:checked').val();
        if (window.reviewAmount > 0) {
            $("#review-scope-frame-list").css("visibility", "hidden");
            $("#review-scope-list-loading").removeClass("d-none");
        } else {
            $("#review-scope").addClass("d-none");
            $("#review-scope-empty").addClass("d-none");
            $("#review-scope-loading").removeClass("d-none");
        }
        window.isReviewLoading = true;
        const params = `?country_code=${countryCode}&product_code=${productCode}&page=${page}&filter=${filter}`;
        fetch(`${location.origin}/review/api-review-list${params}`)
            .then((res) => res.json())
            .then((response) => {
                const amount = parseInt(response.paging?.amount ?? 0);
                const nextPage = parseInt(response.paging?.next_page) || null;
                const prevPage = parseInt(response.paging?.prev_page) || null;
                window.reviewAmount = amount;
                window.reviewNextPage = nextPage;
                window.reviewPrevPage = prevPage;
                if (amount > 0) {
                    const scoreAverage = parseFloat(response.scores?.score_average).toFixed(1);
                    const averageOne = (parseFloat(response.scores?.score_one) / amount) * 100;
                    const averageTwo = (parseFloat(response.scores?.score_two) / amount) * 100;
                    const averageThree = (parseFloat(response.scores?.score_three) / amount) * 100;
                    const averageFour = (parseFloat(response.scores?.score_four) / amount) * 100;
                    const averageFive = (parseFloat(response.scores?.score_five) / amount) * 100;
                    $("#review-score-average").text(scoreAverage);
                    $("#review-score-total").text(`(${amount}) Ulasan`);
                    $("#review-score-five").text(response.scores?.score_five_text);
                    $("#review-score-four").text(response.scores?.score_four_text);
                    $("#review-score-three").text(response.scores?.score_three_text);
                    $("#review-score-two").text(response.scores?.score_two_text);
                    $("#review-score-one").text(response.scores?.score_one_text);
                    $("#review-score-progress-five").css("width", `${averageFive}%`);
                    $("#review-score-progress-four").css("width", `${averageFour}%`);
                    $("#review-score-progress-three").css("width", `${averageThree}%`);
                    $("#review-score-progress-two").css("width", `${averageTwo}%`);
                    $("#review-score-progress-one").css("width", `${averageOne}%`);
                    const el = $("#review-score-star");
                    el.empty();
                    el.raty({
                        score: scoreAverage,
                        number: el.data("number") || 5,
                        cancel: el.data("cancel") || false,
                        target: el.data("target") || false,
                        targetScore: el.data("target-score") || false,
                        precision: el.data("precision") || false,
                        cancelOff: el.data("cancel-off") || "fa fa-fw fa-times-circle text-danger",
                        cancelOn: el.data("cancel-on") || "fa fa-fw fa-times-circle",
                        starHalf: el.data("star-half") || "fa fa-fw fa-star-half-alt text-warning",
                        starOff: el.data("star-off") || "far fa-fw fa-star text-muted",
                        starOn: el.data("star-on") || "fa fa-fw fa-star text-warning",
                        starType: "i",
                        hints: ["Sangat Buruk", "Buruk", "Cukup", "Baik", "Sangat Baik"],
                        readOnly: el.data("readonly") || false,
                        space: true,
                        click: function (score, _evt) {
                            $("#rateScore").val(score);
                        }
                    });
                    this.renderReviews(response.data);
                    $("#review-nav-next").removeClass("d-none");
                    $("#review-nav-prev").removeClass("d-none");
                    $("#review-nav-next").prop("disabled", nextPage ? false : true);
                    $("#review-nav-prev").prop("disabled", prevPage ? false : true);
                    $("#review-scope").removeClass("d-none");
                } else {
                    $("#review-nav-next").addClass("d-none");
                    $("#review-nav-prev").addClass("d-none");
                    $("#review-scope-empty").removeClass("d-none");
                }
            })
            .catch((_error) => {
                $("#review-scope-empty").removeClass("d-none");
            })
            .finally(() => {
                if (window.reviewAmount > 0) {
                    $("#review-scope-frame-list").css("visibility", "visible");
                    $("#review-scope-list-loading").addClass("d-none");
                }
                $("#review-scope-loading").addClass("d-none");
                window.isReviewLoading = false;
            });
    }

    static initValidation() {
        Topupgame.helpers("jq-validation");
        $(".js-validation-product-start-transaction").validate({
            rules: {
                productDenomination: {
                    required: true
                },
                productPaymentMethod: {
                    required: true
                },
                userEmail: {
                    required: true,
                    emailfull: true
                }
            },
            submitHandler: function (_form) {
                return false;
            }
        });
    }

    static responsive(isReviewShown) {
        const viewportWith = document.documentElement.clientWidth || window.innerWidth;
        if (viewportWith <= 768) {
            if ($("#parent-content-review-mobile").find("#content-review").length === 0) {
                $("#content-review").prependTo($("#parent-content-review-mobile"));
            }

            if ($("#parent-content-article-mobile").find("#content-article").length === 0) {
                $("#content-article").prependTo($("#parent-content-article-mobile"));
            }
            if ($("#parent-content-faq-mobile").find("#content-faq").length === 0) {
                $("#content-faq").prependTo($("#parent-content-faq-mobile"));
            }
            if (isReviewShown) {
                $("#parent-content-review-mobile").removeClass("d-none");
            }
            $("#parent-content-article-mobile").removeClass("d-none");
            $("#parent-content-faq-mobile").removeClass("d-none");
        } else {
            if ($("#parent-content-review").find("#content-review").length === 0) {
                $("#content-review").prependTo($("#parent-content-review"));
            }

            if ($("#parent-content-article").find("#content-article").length === 0) {
                $("#content-article").prependTo($("#parent-content-article"));
            }
            if ($("#parent-content-faq").find("#content-faq").length === 0) {
                $("#content-faq").prependTo($("#parent-content-faq"));
            }
            if (isReviewShown) {
                $("#parent-content-review").removeClass("d-none");
            }
            $("#parent-content-article").removeClass("d-none");
            $("#parent-content-faq").removeClass("d-none");
        }
    }

    static async init() {
        this.initValidation();
        Topupgame.helpers("input-text-phone");

        const isReviewShown = $("#parent-content-review-mobile").data("shown") ? true : false;
        this.responsive(isReviewShown);
        if (isReviewShown) {
            this.loadReviews();
        }

        window.addEventListener("pageshow", function (_event) {
            $(".product-block").removeClass("block-mode-loading");
            Topupgame.loader("hide");
            const navigation = String(window.performance.getEntriesByType("navigation")?.[0]?.type);
            if (window.isRefreshedOnBackForward !== "yes" && navigation === "back_forward") {
                window.isRefreshedOnBackForward = "yes";
                return location.reload(true);
            }
        });
        window.addEventListener("beforeunload", function (e) {
            window.isLeavingPage = "yes";
        });

        $('input[type=radio][name="reviewFilter"]').on("change", () => {
            this.loadReviews();
        });

        $("#review-nav-next").on("click", () => {
            if (!window.isReviewLoading) this.loadReviews(window.reviewNextPage);
        });

        $("#review-nav-prev").on("click", () => {
            if (!window.isReviewLoading) this.loadReviews(window.reviewPrevPage);
        });

        //refresh column adjust
        const observer = new MutationObserver((mutationList, _observer) => {
            mutationList.forEach(function (mutation) {
                if (mutation.type === "attributes" && mutation.attributeName === "class") {
                    frontendProduct.responsive(isReviewShown);
                }
            });
        });
        observer.observe(document.querySelector("#page-container"), { attributes: true });
        const section = Topupgame.getQueryParam("section");
        if (section) {
            Topupgame.smoothScrollTo(`#${section}`);
        }

        //rich text pop-up
        if ($("#modal-product-rich-text").length) {
            const isAndroid = /(android)/i.test(navigator.userAgent);
            const state = $("#modal-product-rich-text").data("state");
            const asRedirect = $("#modal-product-rich-text").data("as-redirect") === "yes";
            if (!asRedirect) {
                const productCode = $('meta[name="product-code"]').attr("content");
                const delayed = $("#modal-product-rich-text").data("delayed-time");
                const updatedAt = $("#modal-product-rich-text").data("updated-at") || "";
                const lastUpdatedAt = localStorage.getItem(`${productCode}_rich_text__updated_at`) || "";
                if (`${lastUpdatedAt}` !== `${updatedAt}`) {
                    setTimeout(() => {
                        $("#modal-product-rich-text").modal("show");
                    }, parseInt(delayed) || 1000);
                }
                $("#rich-text-acknowledge").on("click", () => {
                    localStorage.setItem(`${productCode}_rich_text__updated_at`, updatedAt);
                });
            } else {
                if (state === "redirect_android" && !isAndroid) return;
                setTimeout(() => {
                    $("#modal-product-rich-text").modal({ backdrop: "static", keyboard: false });
                    $("#modal-product-rich-text").modal("show");
                }, 200);
            }
        }
    }
}

Topupgame.onLoad(frontendProduct.init());
