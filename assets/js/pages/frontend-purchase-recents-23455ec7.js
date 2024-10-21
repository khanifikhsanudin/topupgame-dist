"use strict";

const purchaseHistoryView = (purchaseList) => {
    let purchaseView = "";
    const xCountry = $('meta[name="x-country-code"]').attr("content") || "US";
    purchaseList = Array.isArray(purchaseList) ? purchaseList : [];
    purchaseList.forEach((item) => {
        const payAmount = item.pay_amount;
        const payCurrency = item.pay_currency;
        const priceText = Topupgame.numberToIntl(payAmount, payCurrency, xCountry);
        const tile = Topupgame.safeImage(item.product_tile_image);
        purchaseView = `
            ${purchaseView}
            <div class="purchase-status block block-rounded" data-order-id="${item.order_id}" style="cursor: pointer;">
                <div class="block-content p-0">
                    <div class="d-flex flex-column">
                        <div class="d-flex align-items-center p-3 p-lg-4">
                            <img class="img-sq img-round-pop flex-shrink-0 me-3 me-lg-4" src="${tile}">
                            <div class="flex-grow-1 d-flex flex-column">
                                <span class="fw-semibold">${item.product_title}</span>
                                <span class="fs-sm">${item.denomination_name}</span>
                            </div>
                            <div class="d-flex flex-column align-items-end">
                                <span class="badge fs-xs rounded-pill mb-2 ${item.status_class}">${item.status_text}</span>
                                <span class="text-currency fw-semibold">${priceText}</span>
                            </div>
                        </div>
                        <div class="d-flex justify-content-between fs-xs text-secondary p-2 bg-body-light d-flex align-items-center rounded-bottom">
                            <span class="fs-sm mb-0">#${item.order_id}</span>    
                            <span class="fs-sm mb-0">${item.date_text}</span>
                        </div>
                    </div>
                </div>
            </div>
        `;
    });
    return purchaseView;
};

class frontendPurchaseRecents {
    static async init() {
        const countryCode = $('meta[name="x-country-code"]').attr("content");
        $(document)
            .on("click", ".container-action", function () {
                const orderId = $(this).data("order-id");
                const statusLink = `${location.origin}/${countryCode}/purchase/order-status/${orderId}`;
                location.href = statusLink;
            })
            .on("click", ".purchase-status", function () {
                const orderId = $(this).data("order-id");
                const statusLink = `${location.origin}/${countryCode}/purchase/order-status/${orderId}`;
                location.href = statusLink;
            });

        $("#userBack").on("click", () => {
            $("#main-form").removeClass("block-mode-loading");
            $("#userResultContainer").addClass("d-none");
            $("#userInputContainer").removeClass("d-none");
        });

        $("#userSubmit").on("click", (e) => {
            if (e.target !== e.currentTarget) return;
            e.stopPropagation();
            let userEmail = $("#userEmail").val();
            $("#main-form").addClass("block-mode-loading");
            setTimeout(() => {
                fetch(`${location.origin}/purchase/api-recents?userEmail=${userEmail}`)
                    .then((response) => response.json())
                    .then((data) => {
                        const purchaseList = data.data;
                        if (data.message === "USER_NOT_ALLOWED") {
                            Topupgame.helpers("jq-notify", {
                                type: "warning",
                                message: "This email is already registered! you need to log in to this account first"
                            });
                            $("#userResultContainer").addClass("d-none");
                            $("#userInputContainer").removeClass("d-none");
                            return;
                        }
                        $("#userResult").empty();
                        if (Array.isArray(purchaseList) && purchaseList.length) {
                            $("#userEmptyResult").addClass("d-none");
                            $("#userResult").html(purchaseHistoryView(purchaseList)).removeClass("d-none");
                        } else {
                            $("#userResult").addClass("d-none");
                            $("#userEmptyResult").removeClass("d-none");
                        }
                        $("#userInputContainer").addClass("d-none");
                        $("#userResultContainer").removeClass("d-none");
                    })
                    .catch((_error) => {
                        $("#userResult").empty().addClass("d-none");
                        $("#userEmptyResult").removeClass("d-none");
                        $("#userInputContainer").addClass("d-none");
                        $("#userResultContainer").removeClass("d-none");
                    })
                    .finally(() => {
                        $("#main-form").removeClass("block-mode-loading");
                    });
            }, 500);
        });
    }
}

Topupgame.onLoad(frontendPurchaseRecents.init());
