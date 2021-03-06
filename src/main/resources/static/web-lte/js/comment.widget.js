Comment.prototype = {
    el: undefined,
    oid: undefined,
    type: undefined,
    avatar: undefined,
    init: function (el) {
        var that = this;
        this.el = el;
        this.oid = $(el).data('oid');
        this.type = $(el).data('type');
        this.avatar = $(el).data('avatar');
        var $commentBox = $('<div class="comment-box"></div>');
        $(this.el).append($commentBox);
        $commentBox.append('<div class="reply-notice"></div>');
        // comment-header
        var $commentHeader = $('<div class="comment-header clearfix"></div>');
        $commentBox.append($commentHeader);
        var $tabsOrder = '<div class="tabs-order">'
            + '<ul class="clearfix">'
            + '<li class="on" data-sort="0">全部评论</li>'
            // + '<li data-sort="2" class="hot-sort" style="display: list-item;">按热度排序</li>'
            + '</ul>'
            + '</div>';
        $commentHeader.append($tabsOrder);
        var $headerPage = '<div class="header-page paging-box"><span class="result">共1页</span><span class="current">1</span></div>';
        $commentHeader.append($headerPage);

        // comment-send
        var $commentSend = $('<div class="comment-send"></div>');
        $commentSend.append('<div class="user-face">\n' +
            '                <img class="user-head"\n' +
            '                     src="' + that.avatar + '?w=72&h=72">\n' +
            '            </div>\n' +
            '            <div class="textarea-container">\n' +
            '                <i class="ipt-arrow"></i>\n' +
            '                <textarea cols="80" name="msg" rows="5"\n' +
            '                          placeholder="请自觉遵守互联网相关的政策法规，严禁发布色情、暴力、反动的言论。"\n' +
            '                          class="ipt-txt"></textarea>\n' +
            '                <button type="submit" class="comment-submit">发表评论</button>\n' +
            '            </div>');
        $commentBox.append($commentSend);
        var $commentList = $('<div class="comment-list"></div>');
        $commentBox.append($commentList);

        // 初始化
        this.requestReply($commentList, this.oid, this.type, 1, 10);

        // 全局事件
        $(this.el).on('click', '.btn-more', function (e) {
            var $target = $(e.target);
            var $replyBox = $target.parents('.reply-box');
            var root = $target.parents('.list-item').data('id');
            that.requestReplyReply($replyBox, that.oid, that.type, root, 1, 10);
        }).on('click', '.reply', function (e) {
            var $target = $(e.target);
            var rid = $target.parents('.list-item').data('id');
            var pid = $target.parents('.reply-item').data('id') || rid;
            var name = $target.parent('.info').prev('.user').children('.name')
                .text();

            var $con = $target.parents('.con');
            // that.showSendBoxHTML($con, rid, pid, name)
            that.appendReplyReplyCommentSend($con, rid, pid, name);
        }).on('click', '.comment-submit', function (e) {
            var $target = $(e.target);
            var $textarea = $target.prevAll('textarea.ipt-txt');
            var message = $textarea.val();
            that.addReply($target, that.oid, that.type, $target.data('rid'), $target.data('pid'), message);
        }).on('click', '.header-page .tcd-number, .header-page .prev, .header-page .next, .bottom-page .tcd-number, .bottom-page .prev, .bottom-page .next', function (e) {
            var $target = $(e.target);
            that.requestReply($commentList, that.oid, that.type, $target.data('page'), 10);
        }).on('keyup', '.bottom-page .page-jump input', function (e) {
            if (e.keyCode === 13) {
                var $target = $(e.target);
                var val = $target.val();
                if (!!val) {
                    that.requestReply($commentList, that.oid, that.type, val, 10);
                }
            }
        }).on('click', '.con .paging-box', function (e) {
            var $target = $(e.target);
            var $replyBox = $target.parents('.con').children('.reply-box');
            var root = $target.parents('.list-item').data('id');
            console.log($replyBox);
            that.requestReplyReply($replyBox, that.oid, that.type, root, $target.data('page'), 10);
        });
    },
    // 评论的HTML
    getReplyHTML: function (reply) {
        return '<div class="list-item reply-wrap " data-id="' + reply.id + '">\n' +
            '                <div class="user-face">\n' +
            '                    <a href="#" target="_blank">\n' +
            '                        <img src="' + (reply.member.avatar || '') + '?w=72&h=72"\n' +
            '                             data-src="holder.js/72x72" alt="">\n' +
            '                    </a>\n' +
            '                </div>\n' +
            '                <div class="con">\n' +
            '                    <div class="user">\n' +
            this.getPrizeHTML(reply.member) +
            '                        <a class="name">' + reply.member.nickname + '</a>\n' +
            '                    </div>\n' +
            '                    <p class="text">' + reply.content.message +
            '                    </p>\n' +
            '                    <div class="info">\n' +
            '                        <span class="time">' + this.format(reply.createdAt) + '</span>\n' +
            '                        <span class="reply btn-hover btn-highlight">回复</span>\n' +
            '                    </div>\n' +
            '                    <div class="reply-box">\n' +
            this.getMoreHTML(reply) +
            '                    </div>\n' +
            '                    <div class="paging-box">\n' +
            '                    </div>\n' +
            '                </div>\n' +
            '            </div>';
    },
    // 查看更多的HTML
    getMoreHTML: function (reply) {
        if (!!reply.rcount && reply.rcount > 0) {
            return '<div class="view-more">共<b>' + reply.rcount + '</b>条回复, <a class="btn-more" data-pid="' + reply.id + '">点击查看</a></div>';
        }
        return '';
    },
    // 评论的回复HTML
    getReplyReplyHTML: function (reply) {
        var html = '<div class="reply-item reply-wrap" data-id="' + reply.id + '">\n' +
            '                            <a href="#" target="_blank" class="reply-face">\n' +
            '                                <img src="' + (reply.member.avatar || '') + '?w=52&h=52"\n' +
            '                                     data-src="holder.js/52x52"></a>\n' +
            '                            <div class="reply-con">\n' +
            '                                <div class="user">\n' +
            '                                    <a href="#" target="_blank" class="name">' + reply.member.nickname + '</a>\n' +
            '                                    <span></span>\n' +
            '                                    <span class="text-con">' + reply.content.message + '</span>\n' +
            '                                </div>\n' +
            '                                <div class="info">\n' +
            '                                    <span class="time">' + this.format(reply.createdAt) + '</span>\n' +
            '                                    <span class="reply btn-hover">回复</span>\n' +
            '                                </div>\n' +
            '                            </div>\n' +
            '                        </div>';
        html += '<div class="paging-box"></div>';
        return html;
    },
    getBottomReplyPageHTML: function (current, currentSize, size, total) {
        var page = this.page(current, currentSize, size, total);
        var html = '';
        if (page.gt1Page()) {
            html += '<div class="bottom-page paging-box-big">';
            if (!page.isHomePage()) {
                html += '<a href="javascript:;" class="prev" data-page="' + (current - 1) + '">上一页</a>';
            }
            if (page.getStart() !== 1) {
                html += '<a href="javascript:;" class="tcd-number" data-page="1">1</a>';
                html += '<span class="dian">...</span>';
            }
            for (var i = page.getStart(); i <= page.getEnd(); i++) {
                if (i === current) {
                    html += '<span class="current">' + i + '</span>';
                    continue;
                }
                html += '<a href="javascript:;" class="tcd-number" data-page="' + i + '">' + i + '</a>';
            }
            if (page.getEnd() !== page.getTotalPage()) {
                html += '<span class="dian">...</span>';
                html += '<a href="javascript:;" class="tcd-number" data-page="' + i + '">' + page.getEnd() + '</a>';
            }
            if (!page.isLastPage()) {
                html += '<a href="javascript:;" class="next"  data-page="' + (current + 1) + '">下一页</a>';
            }
            html += '<div class="page-jump">共<span>' + page.getTotalPage() + '</span>页，跳至<input type="text">页</div>';
            html += '</div>';
        }

        return html;
    },
    getHeaderReplyPageHTML: function (current, currentSize, size, total) {
        var page = this.page(current, currentSize, size, total);
        var html = '';
        html += '<div class="header-page paging-box">';
        html += '<span class="result">共' + page.getTotalPage() + '页</span>';
        if (page.gt1Page()) {
            if (!page.isHomePage()) {
                html += '<a href="javascript:;" class="prev" data-page="' + (current - 1) + '">上一页</a>';
            }
            if (page.getStart() !== 1) {
                html += '<a href="javascript:;" class="tcd-number" data-page="1">1</a>';
                html += '<span class="dian">...</span>';
            }
            for (var i = page.getStart(); i <= page.getEnd(); i++) {
                if (i === current) {
                    html += '<span class="current">' + i + '</span>';
                    continue;
                }
                html += '<a href="javascript:;" class="tcd-number" data-page="' + i + '">' + i + '</a>';
            }
            if (page.getEnd() !== page.getTotalPage()) {
                html += '<span class="dian">...</span>';
                html += '<a href="javascript:;" class="tcd-number" data-page="' + i + '">' + page.getEnd() + '</a>';
            }
            if (!page.isLastPage()) {
                html += '<a href="javascript:;" class="next"  data-page="' + (current + 1) + '">下一页</a>';
            }
        }
        html += '</div>';
        return html;
    },
    getReplyReplyPageHTML: function (current, currentSize, size, total) {
        var page = this.page(current, currentSize, size, total);
        var html = '';
        if (page.gt1Page()) {
            html += '<div class="paging-box">';
            html += '<span class="result">共' + page.getTotalPage() + '页</span>';
            if (!page.isHomePage()) {
                html += '<a href="javascript:;" class="prev" data-page="' + (current - 1) + '">上一页</a>';
            }
            if (page.getStart() !== 1) {
                html += '<a href="javascript:;" class="tcd-number" data-page="1">1</a>';
                html += '<span class="dian">...</span>';
            }
            for (var i = page.getStart(); i <= page.getEnd(); i++) {
                if (i === current) {
                    html += '<span class="current">' + i + '</span>';
                    continue;
                }
                html += '<a href="javascript:;" class="tcd-number" data-page="' + i + '">' + i + '</a>';
            }
            if (page.getEnd() !== page.getTotalPage()) {
                html += '<span class="dian">...</span>';
                html += '<a href="javascript:;" class="tcd-number" data-page="' + i + '">' + page.getEnd() + '</a>';
            }
            if (!page.isLastPage()) {
                html += '<a href="javascript:;" class="next"  data-page="' + (current + 1) + '">下一页</a>';
            }
            html += '</div>';
        }
        return html;
    },
    appendReplyReplyCommentSend: function ($target, rid, pid, name) {
        var placeholder = !!name ? '回复 ' + name + ' :' : '请自觉遵守互联网相关的政策法规，严禁发布色情、暴力、反动的言论。';
        $target.parents('.comment-list').find('.con .comment-send').remove();
        var $boxComment = $target.parents('.comment-box');
        var $commentSend = $boxComment.find('.comment-send').first().clone(true);
        $commentSend.find('textarea.ipt-txt').attr('placeholder', placeholder);
        $commentSend.find('button.comment-submit[type="submit"]')
            .data('rid', rid).data('pid', pid);
        $target.append($commentSend);
    },
    requestReply: function ($commentList, oid, type, page, size) { // 根级分页
        var that = this;
        console.log('requestReply', $commentList, oid, type, page, size);
        $.post('/api/v1/reply', {
            oid: oid,
            type: type,
            page: page || 1,
            size: size || 10
        }, function (rs) {
            if (rs.code === 200 && rs.data.result.length > 0) {
                $commentList.empty();
                $.each(rs.data.result, function (i, reply) {
                    $commentList.append($(that.getReplyHTML(reply)));
                });
                // 顶部分页
                var $commentBox = $commentList.parent('.comment-box');
                var $commentHeader = $commentBox.children('.comment-header');
                $commentHeader.children('.header-page').remove();
                $commentHeader.append(that.getHeaderReplyPageHTML(rs.data.current, rs.data.result.length, rs.data.size, rs.data.total));

                // 底部分页
                $commentList.children('.bottom-page').remove();
                $commentList.append(that.getBottomReplyPageHTML(rs.data.current, rs.data.result.length, rs.data.size, rs.data.total));
                if (Math.ceil(rs.data.total / rs.data.size) > 1) {
                    $commentList.append($commentList.prev().clone(true))
                }
            } else {
                layer.msg(rs.message);
            }
        }, 'json');
    },
    requestReplyReply: function ($replyBox, oid, type, root, page, size) { // 子级分页
        var that = this;
        console.log('requestReplyReply', $replyBox, oid, type, root, page, size);
        $.post('/api/v1/reply/reply', {
            oid: oid,
            type: type,
            root: root,
            page: page || 1,
            size: size || 10
        }, function (rs) {
            if (rs.code === 200 && rs.data.result.length > 0) {
                $replyBox.empty();
                $.each(rs.data.result, function (i, reply) {
                    $replyBox.append(that.getReplyReplyHTML(reply));
                });
                // 分页
                var $con = $replyBox.parent('.con');
                $con.children('.paging-box').replaceWith($(that.getReplyReplyPageHTML(rs.data.current,
                    rs.data.result.length,
                    rs.data.size,
                    rs.data.total)));

            } else {
                layer.msg(rs.message);
            }
        }, 'json');
    },
    getPrizeHTML: function (member) {
        var prize;
        switch (member.type) {
            case 0:
                prize = '管理员';
                break;
            case 1:
            default:
                return '';
        }
        return '<span class="stick assist">' + prize + '</span>';
    },
    addReply: function ($commentSubmit, oid, type, rid, pid, message) {
        var that = this;
        $.post('/api/v1/reply/add', {
            oid: oid,
            type: type,
            root: rid || '',
            parent: pid || '',
            message: message
        }, function (rs) {
            if (rs.code === 200) {
                layer.msg(rs.message);
                // 清空内容
                $commentSubmit.prevAll('textarea.ipt-txt').val('');
                if (!rs.data.root) {// 根评论 添加到最前面
                    $commentSubmit.parents('.comment-box').children('.comment-list')
                        .prepend(that.getReplyHTML(rs.data));
                } else { // 评论的评论 添加到后面
                    $commentSubmit.parents('.con').children('.reply-box')
                        .append(that.getReplyReplyHTML(rs.data));
                }
            } else {
                layer.msg(rs.message, {icon: 2});
            }
        }, 'json');
    },
    format: function (timestamp) {
        return moment.unix(timestamp / 1000).format('YYYY-MM-DD hh:mm');
    },
    page: function (current, currentSize, size, total) {
        return {
            getTotalPage: function () {
                return Math.ceil(total / size);
            },
            gt5Page: function () {
                return this.getTotalPage() > 5;
            },
            gt1Page: function () {
                return this.getTotalPage() > 1;
            },
            isHomePage: function () {
                return current === 1;
            },
            isLastPage: function () {
                return current === this.getTotalPage();
            },
            getCurrentSize: function () {
                return currentSize;
            },
            getStart: function () {
                var number = current - 2;
                return number > 0 ? number : 1;
            },
            getEnd: function () {
                var number = current + 2;
                return number > this.getTotalPage() ? this.getTotalPage() : number;
            }
        };
    }
};


function Comment(el) {
    var o = {};
    o.__proto__ = Comment.prototype;
    o.init(el);
    return o;
}