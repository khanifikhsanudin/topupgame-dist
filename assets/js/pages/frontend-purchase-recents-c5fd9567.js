"use strict";

const purchaseHistoryView = (purchaseList) => {
    let purchaseView = "";
    purchaseList = Array.isArray(purchaseList) ? purchaseList : [];
    purchaseList.forEach((item) => {
        const priceText = Topupgame.numberToIDRSlim(item.price_idr);
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
    if (purchaseList.length >= 5) {
        purchaseView = `
            ${purchaseView}
            <div class="d-flex justify-content-center w-100">
                <u class="text-primary"><a href="${location.origin}/member/purchases" class="fw-semibold text-primary">Lihat selengkapnya <i class="fa fa-right ms-1"></i></a></u>
            </div>
        `;
    }
    return purchaseView;
};

class frontendPurchaseRecents {
    static async init() {
        $(document)
            .on("click", ".container-action", function () {
                const orderId = $(this).data("order-id");
                const statusLink = `${location.origin}/purchase/order-status/${orderId}`;
                location.href = statusLink;
            })
            .on("click", ".purchase-status", function () {
                const orderId = $(this).data("order-id");
                const statusLink = `${location.origin}/purchase/order-status/${orderId}`;
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
            let userPhoneNumber = $("#userPhoneNumber").val();
            $("#main-form").addClass("block-mode-loading");
            setTimeout(() => {
                fetch(`${location.origin}/purchase/api-recents?userPhoneNumber=${userPhoneNumber}`)
                    .then((response) => response.json())
                    .then((data) => {
                        const purchaseList = data.data;
                        if (data.message === "USER_NOT_ALLOWED") {
                            Topupgame.helpers("jq-notify", {
                                type: "warning",
                                message: "Nomor ini sudah terdaftar! anda perlu masuk ke akun ini dahulu"
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
