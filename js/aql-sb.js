window.addEventListener('DOMContentLoaded', function() {

    let historyRecords = [];

    // 全角数字を半角数字に変換する
    function ConvertNumberDoubleToSingleByte(str) {
        ret = str.replace(/[０-９]/g, function (s) {
            return String.fromCharCode(s.charCodeAt(0) - 0xFEE0);
        })
        return ret;
    }

    // 数値入力の正規化(半角の自然数にする)
    function NormalizeAndValidateNumberString(str) {
        ret = ConvertNumberDoubleToSingleByte(str);
        return ret.trim();
    }

    // チーム得点計算
    function CalcTeamPt(arr_pt) {
        let ret = 1;
        for(let i = 0; i < arr_pt.length; i++) {
            ret *= arr_pt[i].innerText;
        }
        return ret;
    }

    // リーチ判定(個人)
    function JudgeReach_personal(team_pt, player_pt) {
        if ((parseInt(team_pt) / parseInt(player_pt)) * (parseInt(player_pt) + 1) >= parseInt(document.getElementById("winning-pt").value)) {
            return true;
        } else {
            return false;
        }
    }

    // リーチ判定(チーム)
    function JudgeReach_Team(team) {
        let team_pt = document.getElementById("team-" + team + "-pt").innerText;
        for (let i = 1; i <= 5; i ++) {
            let obj_pt = document.getElementById(team + i + "-pt");
            if (JudgeReach_personal(team_pt, obj_pt.innerText)) {
                obj_pt.style.backgroundColor = 'orange';
            } else {
                obj_pt.style.backgroundColor = 'transparent';
            }
        }
    }

    // 封鎖判定(個人)
    function JudgeBlockade_Personal(incorrect_pt) {
        if (incorrect_pt == '✕✕') {
            return true;
        }
        else {
            return false;
        }
    }

    // 封鎖判定(チーム)
    function JudgeBlockade_Team(team) {
        for (let i = 1; i <= 5; i ++) {
            let player_name = document.getElementById("name-" + team + i)
            let obj_pt = document.getElementById(team + i + "-pt");
            let incorrect_pt = document.getElementById(team + i + "-incorrect");
            if (JudgeBlockade_Personal(incorrect_pt.innerText)) {
                player_name.style.backgroundColor = 'red';
                incorrect_pt.style.backgroundColor = 'red';
                obj_pt.style.backgroundColor = 'red';
            } else {
                player_name.style.backgroundColor = 'transparent';
                if (obj_pt.style.backgroundColor !== 'orange') {
                    obj_pt.style.backgroundColor = 'transparent';
                }
                incorrect_pt.style.backgroundColor = 'transparent';
            }
        }
    }

    // 勝敗結果表示
    function DisplayMathcResult(result) {
        let obj_team_a_pt = document.getElementById("team-a-pt");
        let obj_team_b_pt = document.getElementById("team-b-pt");
        let a_result_display = document.getElementById("a-result-display");
        let b_result_display = document.getElementById("b-result-display");
        let winning_pt = parseInt(document.getElementById("winning-pt").value);
        obj_team_a_pt.style.backgroundColor = 'transparent';
        obj_team_b_pt.style.backgroundColor = 'transparent';
        switch (result[0]) {
            case 'awin':
                obj_team_a_pt.style.backgroundColor = 'orange';
                a_result_display.innerText = 'WIN';
                b_result_display.innerText = 'LOSE';
                if (result[1] == true) {obj_team_a_pt.innerText = winning_pt;}
                break;
            case 'bwin':
                obj_team_b_pt.style.backgroundColor = 'orange';
                a_result_display.innerText = 'LOSE';
                b_result_display.innerText = 'WIN';
                if (result[1] == true) {obj_team_b_pt.innerText = winning_pt;}
                break;
            case 'draw':
                a_result_display.innerText = 'DRAW';
                b_result_display.innerText = 'DRAW';
                break;
            default:
                a_result_display.innerText = '';
                b_result_display.innerText = '';
        }
    }

    // 勝利判定(戻り値: array 第0要素 {TeamA勝利: 'awin', TeamB勝利: 'bwin', 引分け: 'draw', 継続中:'ongoing'},
    //                       第1要素 {勝利ポイント以上での勝利か？ yes: true, no: false})
    function JudgeMatch() {
        let winning_pt = parseInt(document.getElementById("winning-pt").value);
        let obj_team_a_pt = document.getElementById("team-a-pt");
        let obj_team_b_pt = document.getElementById("team-b-pt");
        let a_pt = parseInt(obj_team_a_pt.innerText);
        let b_pt = parseInt(obj_team_b_pt.innerText);
        // 勝利ポイントを超えたチームは勝ちとする
        if (parseInt(a_pt) >= winning_pt) {
            return ['awin', true];
        }
        else if (parseInt(b_pt) >= winning_pt) {
            return ['bwin', true];
        }
        // 一方のチーム全員が２✕になったら相手チームを勝ちとする
        let teams = ['a', 'b'];
        let loseteam = 'ongoing'
        for (let i = 0; i < teams.length; i++) {
            let team = teams[i];
            loseteam = team;
            let player_incorrects = document.getElementsByClassName("team-" + team + "-player-incorrect");
            for (let j = 0; j < player_incorrects.length; j++) {
                let player_incorrect = player_incorrects[j];
                if (player_incorrect.innerText != '✕✕') {
                    loseteam = 'ongoing';
                    break;
                }
            }
            if (loseteam != 'ongoing') {
                break;
            }
        }
        switch (loseteam) {
            case 'a' :
                return ['bwin', false];
            case 'b' :
                return ['awin', false];
            default :
        }
        // 問題数上限が無ければ試合継続中として関数を抜ける
        if (document.getElementById("infinity").checked) {
            return 'ongoing';
        }
        // 規定問題数終了していなければ試合継続中として関数を抜ける？
        let max_of_questions = parseInt(document.getElementById("max-of-questions").value);
        let done = parseInt(document.getElementById("secret-counter").innerText);
        if (max_of_questions >= done) {
            return 'ongoing';
        }
        // 規定問題集終了したので勝利判定する
        if (a_pt > b_pt) {
            return ['awin', false];
        }
        else if (b_pt > a_pt) {
            return ['bwin', false];
        }
        else {
            return ['draw', false];
        }
    }

    // 全体を再計算
    function CalcAll() {
        var arr_a_pt = document.getElementsByClassName("team-a-player-pt");
        var arr_b_pt = document.getElementsByClassName("team-b-player-pt");
        var a_pt = CalcTeamPt(arr_a_pt);
        var b_pt = CalcTeamPt(arr_b_pt);
        document.getElementById("team-a-pt").innerText=a_pt;
        document.getElementById("team-b-pt").innerText=b_pt;
        JudgeReach_Team('a');
        JudgeReach_Team('b');
        JudgeBlockade_Team('a');
        JudgeBlockade_Team('b');
        let result = JudgeMatch();
        DisplayMathcResult(result);
    }

    // 問題数表示を更新する
    function RefreshNumberOfDone() {
        let blnshow = (document.getElementById("show-hide-counter").value == "Show Count");
        let counter = document.getElementById("number-of-done");
        if (blnshow) {
            counter.innerText = '?';
            HideHistoryNumber(true);
        }
        else
        {
            let count = parseInt(document.getElementById("secret-counter").innerText);
            let max_of_questions = parseInt(document.getElementById("max-of-questions").value);
            let infinity = document.getElementById("infinity");
            if (infinity.checked||count <= max_of_questions) {
                counter.innerText = document.getElementById("secret-counter").innerText;
            }
            else{
                counter.innerText ="END";
            }
            HideHistoryNumber(false);
        }
    }

    // 問題数を+1する
    function SecretCounterUp() {
        let done = parseInt(document.getElementById("secret-counter").innerText);
        document.getElementById("secret-counter").innerText = done + 1;
        RefreshNumberOfDone();
    }

    // 終了状態の判断
    function isEnd() {
        if (document.getElementById("a-result-display").innerText != '') {
            return true;
        }
        else {
            return false;
        }
    }

    // historyの全員の正誤成績を集計して表示する
    function SumAllPlayersResult() {
        let teams = ['a', 'b'];
        for (let i = 0; i < teams.length; i++) {
            let team = teams[i];
            for (let j = 1; j <= 5; j++) {
                let player = team + j;
                SumOneOlayerResult(player)
                SumOneMemberResult(player, 1);
                SumOneMemberResult(player, 2);
            }
        }
    }

    // historyの個人の正誤成績を集計して表示する
    function SumOneOlayerResult(player) {
        let cells = document.getElementsByClassName(player + "-history");
        let result_cell = document.getElementById(player + "-player-sum");
        let cnt_correct = 0;
        let cnt_incorrect = 0;
        for (let i = 0; i < cells.length; i ++) {
            let txt = cells[i].innerText;
            if (txt.startsWith('〇')) {
                cnt_correct++;
            }
            else if (txt.startsWith('✕')){
                cnt_incorrect++;
            }
        }
        result_cell.innerText = `〇:${cnt_correct} ✕:${cnt_incorrect}`;
    }

    // historyの個人メンバー別の正誤成績を集計して表示する
    function SumOneMemberResult(player, memberNumber) {
        let cells = document.getElementsByClassName(player + "-member-" + memberNumber + "-history");
        let result_cell = document.getElementById(player + "-member-" + memberNumber + "-sum");
        let cnt_correct = 0;
        let cnt_incorrect = 0;
        for (let i = 0; i < cells.length; i ++) {
            let txt = cells[i].innerText;
            if (txt.startsWith('〇')) {
                cnt_correct++;
            }
            else if (txt.startsWith('✕')){
                cnt_incorrect++;
            }
        }
        result_cell.innerHTML = `〇:${cnt_correct}<br>✕:${cnt_incorrect}`;
    }

    // historyテーブルを一番下までスクロールする
    function ScrollToBottomHistoryTable() {
        let table = document.getElementsByClassName("history-data");
        for (let i = 0; i < table.length; i ++) {
            table[i].scrollTop = table[i].scrollHeight;
        }
    }

    // historyテーブルに列を追加する
    function SetHistoryResultCell(cell, ox) {
        if (ox == 'o') {            // 半角文字
            cell.innerText = '〇';  // 全角文字
        }
        else if (ox == 'x') {       // 半角文字
            cell.innerText = '✕';  // 全角文字
        }
    }

    function RecordHistoryEntry(questionNo, team, player, ox, memberNumber) {
        let type = 'through';
        if (ox == 'o') {
            type = 'correct';
        }
        else if (ox == 'x') {
            type = 'incorrect';
        }
        historyRecords.push({
            questionNo: questionNo,
            type: type,
            teamId: team || null,
            playerNumber: player || null,
            playerId: team && player ? team + player : null,
            memberNumber: memberNumber || null
        });
    }

    function RenderHistoryRow(questionNo, team, player, ox, memberNumber) {
        let table = document.getElementsByClassName("history-table");
        for (let i = 0; i < table.length; i ++) {
            let table_i = table[i];
            let id = table_i.id;
            let num_row = table_i.rows.length;
            let row = table_i.insertRow(num_row - 1);
            row.classList.add('history-data-row');
            let cell1 = row.insertCell(-1);
            cell1.classList.add('row-header');
            RefreshNumberOfDone();
            cell1.innerText = questionNo;
            //
            let is_acted_table = (id == 'history-team-' + team);
            for (let j = 1; j <= 5; j ++) {
                let cell_player_number = j;
                if (i ==0) {
                    cell_player_number = 6 - cell_player_number;
                }
                if (is_acted_table && player == cell_player_number && memberNumber != undefined) {
                    for (let memberCellNumber = 1; memberCellNumber <= 2; memberCellNumber++) {
                        let cell = row.insertCell(-1);
                        cell.id = team + cell_player_number + '-' + memberCellNumber + '-history-' + num_row;
                        cell.classList.add(team + cell_player_number + '-history');
                        cell.classList.add(team + cell_player_number + '-member-' + memberCellNumber + '-history');
                        if (memberNumber == memberCellNumber) {
                            SetHistoryResultCell(cell, ox);
                        }
                    }
                }
                else {
                    let cell = row.insertCell(-1);
                    cell.id = team + cell_player_number + '-history-' + num_row;
                    cell.classList.add(team + cell_player_number + '-history');
                    cell.setAttribute('colspan', '2');
                    if (is_acted_table && player == cell_player_number) {
                        SetHistoryResultCell(cell, ox);
                    }
                    if (team == undefined) {
                        cell.style.backgroundColor = '#CCCCCC';
                    }
                }
            }
        }
        SumAllPlayersResult();
        ScrollToBottomHistoryTable();
    }

    function AddARowToHistoryTable(team, player, ox, memberNumber) {
        let questionNo = document.getElementById("history-team-a").rows.length;
        RecordHistoryEntry(questionNo, team, player, ox, memberNumber);
        RenderHistoryRow(questionNo, team, player, ox, memberNumber);
    }

    // historyテーブルの履歴行を全て削除する
    function DeleteAllHistoryRows() {
        let table = document.getElementsByClassName("history-table");
        for (let i = 0; i < table.length; i ++) {
            let table_i = table[i];
            for (let j = table_i.rows.length - 2; j >= 0 ; j --) {
                table_i.deleteRow(j);
            }
        }
    }

    // historyテーブルを初期化する
    function ResetHistoryTable() {
        // 履歴行を全て削除する
        DeleteAllHistoryRows();
        historyRecords = [];
        // 個人成績を初期化する
        SumAllPlayersResult();
    }

    // historyテーブルの問題番号列の表示／非表示を切り替える
    function HideHistoryNumber(bHide) {
        let hideshow = 'visible';
        if (bHide) {
            hideshow = 'hidden';
        }
        let table = document.getElementsByClassName("history-table");
        for (let i = 0; i < table.length; i ++) {
            let table_i = table[i];
            for (let j = table_i.rows.length - 2; j >= 0 ; j --) {
                table_i.rows[j].cells[0].style.visibility = hideshow;
            }
        }
    }

    // infinityチェックボックス押下イベントを設定
    function SetInfinity() {
        let infinity = document.getElementById("infinity");
        let max_of_questions = document.getElementById("max-of-questions");
        infinity.addEventListener('change', function() {
            if (infinity.checked) {
                max_of_questions.setAttribute("escape-value", max_of_questions.value);
                max_of_questions.disabled = true;
                max_of_questions.value = "no limit";
            }
            else {
                max_of_questions.disabled = false;
                max_of_questions.value = max_of_questions.getAttribute("escape-value");
            }
        }, false);
    }

    // 正解ボタン押下イベントを設定
    function SetCorrectButton(team) {
        for (let i = 1; i <= 5; i ++) {
            let p = team + i;
            document.getElementById(p + "-btn-correct").addEventListener('click', function() {
                InputCorrect(team, i);
            }, false);
        }
    }

    // 正解を入力する
    function InputCorrect(team, playerNumber, memberNumber) {
        let p = team + playerNumber;
        if (isEnd()) {return;};
        if (document.getElementById(p + '-incorrect').innerText == '✕✕') {return;}
        let pt = parseInt(document.getElementById(p + "-pt").innerText);
        document.getElementById(p + "-pt").innerText = pt + 1;
        SecretCounterUp();
        AddARowToHistoryTable(team, playerNumber, 'o', memberNumber);
        CalcAll();
    }

    // 誤答ボタン押下イベントを設定
    function SetIncorrectButton(my_team,enemy_team) {
        for (let i = 1; i <= 5; i++) {
            let p = my_team + i;

            document.getElementById(p + "-btn-incorrect").addEventListener('click', function() {
                InputIncorrect(my_team, enemy_team, i);
            }, false);
        }
    }

    // 誤答を入力する
    function InputIncorrect(my_team, enemy_team, playerNumber, memberNumber) {
        let p = my_team + playerNumber;
        if (isEnd()) {return;};
        let obj_x = document.getElementById(p + '-incorrect');
        if (obj_x.innerText == '') {
            obj_x.innerText = '✕'
        }
        else if (obj_x.innerText == '✕') {
            obj_x.innerText = '✕✕';
        }
        else{
            return;
        }
        // 相手の解答権が無い人を復活させる
        for (let j = 1; j <=  5; j++) {
            let e = enemy_team + j;
            let obj_e_x = document.getElementById(e + '-incorrect');
            if (obj_e_x.innerText == '✕✕') {
                obj_e_x.innerText = '✕';
            }
        }
        document.getElementById(p + "-pt").innerText = 1;
        SecretCounterUp();
        AddARowToHistoryTable(my_team, playerNumber, 'x', memberNumber);
        CalcAll();
    }

    // 個人用の正解・誤答ボタン押下イベントを設定
    function SetMemberStatusButton(team, enemy_team) {
        for (let i = 1; i <= 5; i++) {
            for (let memberNumber = 1; memberNumber <= 2; memberNumber++) {
                document.getElementById("member-" + team + i + "-" + memberNumber + "-btn-correct").addEventListener('click', function() {
                    InputCorrect(team, i, memberNumber);
                }, false);
                document.getElementById("member-" + team + i + "-" + memberNumber + "-btn-incorrect").addEventListener('click', function() {
                    InputIncorrect(team, enemy_team, i, memberNumber);
                }, false);
            }
        }
    }

    // データの個別修正処理を設定
    function SetDataChangeEvent(team) {
        for (let i = 1; i <= 5; i ++) {
            let p = team + i;
            // 個人点数の修正処理
            let pt_cell = document.getElementById(p + "-pt");
            pt_cell.addEventListener('dblclick', function() {
                let val = window.prompt("変更する値を入力してください", pt_cell.innerText);
                val = NormalizeAndValidateNumberString(val);
                val = parseInt(val);
                if ((Number.isInteger(val)) && (val > 0)) {
                    pt_cell.innerText = val;
                    CalcAll();
                }
                else {
                    alert("正の整数ではありません")
                }
            }, false);

            // 個人不正解数の修正処理
            let incorrect_cell = document.getElementById(p + "-incorrect");
            incorrect_cell.addEventListener('dblclick', function() {
                let val = window.prompt("変更する値を入力してください", incorrect_cell.innerText);
                if (val == null) {
                    return;
                }
                else if (val == ''||val == '✕'||val == '✕✕') {
                    incorrect_cell.innerText = val;
                    CalcAll();
                }
                else {
                    alert("入力が正しくありません")
                }
            }, false);
        }
    }

    // 枠内に収まるようにメンバー名入力欄の文字サイズを調整する
    function FitMemberNameInput(input) {
        const maxFontSize = 14;
        const minFontSize = 9;
        input.style.fontSize = maxFontSize + 'px';
        for (let size = maxFontSize; size >= minFontSize; size--) {
            input.style.fontSize = size + 'px';
            if (input.scrollWidth <= input.clientWidth) {
                return;
            }
        }
    }

    // メンバー名入力欄の自動文字サイズ調整を設定
    function SetMemberNameFitEvent() {
        const inputs = document.querySelectorAll('.member-name input');
        for (let i = 0; i < inputs.length; i++) {
            FitMemberNameInput(inputs[i]);
            inputs[i].addEventListener('input', function() {
                FitMemberNameInput(inputs[i]);
            }, false);
        }
    }

    // チームの初期化
    function ResetPlayerPt(team) {
        // ポイントの初期化
        for (let i = 1; i<=5; i ++) {
            let p = team + i;
            document.getElementById(p + "-pt").innerText = '1';
            document.getElementById(p + "-incorrect").innerText = '';
            CalcAll();
        }
    }

    // テキスト出力用の文字列を生成する
    function CreateResultString() {
        let outtxt = '';
    }

    function GetTeamExportData(team) {
        let teamElement = document.getElementById("team-" + team);
        let teamName = teamElement.querySelector("tr.team-name input").value;
        let players = [];
        for (let i = 1; i <= 5; i++) {
            players.push({
                playerId: team + i,
                slotName: document.getElementById("name-" + team + i).value,
                members: [
                    document.getElementById("member-" + team + i + "-1").value,
                    document.getElementById("member-" + team + i + "-2").value
                ],
                point: parseInt(document.getElementById(team + i + "-pt").innerText),
                incorrect: document.getElementById(team + i + "-incorrect").innerText,
                resultSummary: document.getElementById(team + i + "-player-sum").innerText,
                memberResultSummary: [
                    document.getElementById(team + i + "-member-1-sum").innerText,
                    document.getElementById(team + i + "-member-2-sum").innerText
                ]
            });
        }
        return {
            teamId: team,
            name: teamName,
            score: parseInt(document.getElementById("team-" + team + "-pt").innerText),
            result: document.getElementById(team + "-result-display").innerText,
            players: players
        };
    }

    function CreateHistoryExportData() {
        return {
            appName: 'AQL Score Board',
            exportVersion: 1,
            exportedAt: new Date().toISOString(),
            config: {
                winningPoint: parseInt(document.getElementById("winning-pt").value),
                maxQuestions: document.getElementById("infinity").checked ? null : parseInt(document.getElementById("max-of-questions").value),
                infinity: document.getElementById("infinity").checked
            },
            currentQuestion: parseInt(document.getElementById("secret-counter").innerText),
            displayQuestion: document.getElementById("number-of-done").innerText,
            showCount: document.getElementById("show-hide-counter").value == 'Hide Count',
            showHistory: document.getElementById("history-show-hide").value == 'Hide History',
            teams: [
                GetTeamExportData('a'),
                GetTeamExportData('b')
            ],
            history: historyRecords
        };
    }

    function CreateTimestampString(date) {
        function pad2(value) {
            return String(value).padStart(2, '0');
        }
        return date.getFullYear()
            + pad2(date.getMonth() + 1)
            + pad2(date.getDate())
            + '-'
            + pad2(date.getHours())
            + pad2(date.getMinutes())
            + pad2(date.getSeconds());
    }

    function DownloadJson(data, fileName) {
        let blob = new Blob([JSON.stringify(data, null, 2)], {type: 'application/json'});
        let url = URL.createObjectURL(blob);
        let link = document.createElement('a');
        link.href = url;
        link.download = fileName;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    }

    function SaveHistoryJson() {
        let data = CreateHistoryExportData();
        let fileName = 'aql-score-history-' + CreateTimestampString(new Date()) + '.json';
        DownloadJson(data, fileName);
    }

    function GetOxFromHistoryType(type) {
        if (type == 'correct') {
            return 'o';
        }
        else if (type == 'incorrect') {
            return 'x';
        }
        return undefined;
    }

    function ApplyShowHistoryState(showHistory) {
        let showhide_history_btn = document.getElementById("history-show-hide");
        showhide_history_btn.value = showHistory ? 'Hide History' : 'Show History';
        let history_data_row = document.getElementsByClassName("history");
        for (let i = 0; i < history_data_row.length; i++) {
            history_data_row[i].style.display = showHistory ? "block" : "none";
        }
    }

    function ApplyImportedTeamData(teamData) {
        if (!teamData || !teamData.teamId) {
            return;
        }
        let team = teamData.teamId;
        let teamElement = document.getElementById("team-" + team);
        teamElement.querySelector("tr.team-name input").value = teamData.name || team.toUpperCase();
        if (!teamData.players) {
            return;
        }
        for (let i = 0; i < teamData.players.length; i++) {
            let player = teamData.players[i];
            let playerNumber = parseInt(player.playerId.replace(team, ''));
            document.getElementById("name-" + team + playerNumber).value = player.slotName || team.toUpperCase() + playerNumber;
            document.getElementById("member-" + team + playerNumber + "-1").value = player.members && player.members[0] ? player.members[0] : '';
            document.getElementById("member-" + team + playerNumber + "-2").value = player.members && player.members[1] ? player.members[1] : '';
            document.getElementById(team + playerNumber + "-pt").innerText = player.point || 1;
            document.getElementById(team + playerNumber + "-incorrect").innerText = player.incorrect || '';
        }
    }

    function RenderImportedHistory(history) {
        DeleteAllHistoryRows();
        historyRecords = [];
        if (!history) {
            SumAllPlayersResult();
            return;
        }
        for (let i = 0; i < history.length; i++) {
            let entry = history[i];
            historyRecords.push({
                questionNo: entry.questionNo,
                type: entry.type,
                teamId: entry.teamId || null,
                playerNumber: entry.playerNumber || null,
                playerId: entry.playerId || null,
                memberNumber: entry.memberNumber || null
            });
            RenderHistoryRow(
                entry.questionNo,
                entry.teamId || undefined,
                entry.playerNumber || undefined,
                GetOxFromHistoryType(entry.type),
                entry.memberNumber || undefined
            );
        }
        SumAllPlayersResult();
        ScrollToBottomHistoryTable();
    }

    function ImportHistoryData(data) {
        if (!data || !Array.isArray(data.teams) || !Array.isArray(data.history)) {
            alert("読み込める履歴JSONではありません");
            return;
        }

        if (data.config) {
            document.getElementById("winning-pt").value = data.config.winningPoint || 200;
            document.getElementById("winning-pt").setAttribute("escape-value", document.getElementById("winning-pt").value);
            let infinity = document.getElementById("infinity");
            let maxQuestions = document.getElementById("max-of-questions");
            infinity.checked = data.config.infinity == true;
            if (infinity.checked) {
                maxQuestions.setAttribute("escape-value", data.config.maxQuestions || maxQuestions.getAttribute("escape-value") || 40);
                maxQuestions.disabled = true;
                maxQuestions.value = "no limit";
            }
            else {
                maxQuestions.disabled = false;
                maxQuestions.value = data.config.maxQuestions || 40;
                maxQuestions.setAttribute("escape-value", maxQuestions.value);
            }
        }

        for (let i = 0; i < data.teams.length; i++) {
            ApplyImportedTeamData(data.teams[i]);
        }
        document.getElementById("secret-counter").innerText = data.currentQuestion || 1;
        document.getElementById("show-hide-counter").value = data.showCount ? 'Hide Count' : 'Show Count';
        RenderImportedHistory(data.history);
        CalcAll();
        RefreshNumberOfDone();
        ApplyShowHistoryState(data.showHistory !== false);
        SetMemberNameFitEvent();
    }

    function ImportHistoryJsonFile(file) {
        if (!file) {
            return;
        }
        let reader = new FileReader();
        reader.onload = function(event) {
            try {
                ImportHistoryData(JSON.parse(event.target.result));
            }
            catch (e) {
                alert("履歴JSONの読み込みに失敗しました");
            }
        };
        reader.readAsText(file);
    }

    // "reset"ボタン押下時の処理
    document.getElementById("btn-reset").addEventListener('click', function() {
        if (!confirm('全てリセットしてよろしいですか？')) {
            return;
        }
        ResetPlayerPt('a');
        ResetPlayerPt('b');
        document.getElementById("secret-counter").innerText = "1";
        RefreshNumberOfDone();
        ResetHistoryTable();
        document.getElementById("a-result-display").innerText = '';
        document.getElementById("b-result-display").innerText = '';
    }, false);

    // "refresh"ボタン押下時の処理
    this.document.getElementById("btn-refresh").addEventListener('click', function(){
        CalcAll();
    }, false);

    // "save history"ボタン押下時の処理
    document.getElementById("btn-save-history").addEventListener('click', function(){
        SaveHistoryJson();
    }, false);

    // "import history"ボタン押下時の処理
    document.getElementById("btn-import-history").addEventListener('click', function(){
        document.getElementById("import-history-file").click();
    }, false);

    // 履歴JSONファイル選択時の処理
    document.getElementById("import-history-file").addEventListener('change', function(){
        ImportHistoryJsonFile(this.files[0]);
        this.value = '';
    }, false);

    // "winning points"の入力時のバリデーションと再計算
    document.getElementById("winning-pt").addEventListener('blur', function(){
        const winPt = document.getElementById("winning-pt");
        var newValue = NormalizeAndValidateNumberString(winPt.value);
        newValue = parseInt(newValue);
        if ((Number.isInteger(newValue)) && (newValue > 0)) {
            winPt.value = newValue;
            winPt.setAttribute("value", newValue);
            winPt.setAttribute("escape-value", newValue);
            CalcAll();
        }
        else {
            const escValue = winPt.getAttribute("escape-value");
            winPt.value = escValue;
        }
    }), false;

    // "max of questions"の入力時のバリデーションと再計算
    document.getElementById("max-of-questions").addEventListener('blur', function(){
        const maxQuestions = document.getElementById("max-of-questions");
        var newValue = NormalizeAndValidateNumberString(maxQuestions.value);
        newValue = parseInt(newValue);
        if ((Number.isInteger(newValue)) && (newValue > 0)) {
            maxQuestions.value = newValue;
            maxQuestions.setAttribute("value", newValue);
            maxQuestions.setAttribute("escape-value", newValue);
            CalcAll();
        }
        else {
            const escValue = maxQuestions.getAttribute("escape-value");
            maxQuestions.value = escValue;
        }
    }), false;

    // "Throwgh"ボタン押下時の処理
    document.getElementById("through").addEventListener('click', function() {
        if (isEnd()) {return;};
        SecretCounterUp();
        AddARowToHistoryTable();
    }, false);

　  // "Show Count/Hide Count"ボタン押下時の処理
    document.getElementById("show-hide-counter").addEventListener('click', function() {
        let showhide_count_btn = document.getElementById("show-hide-counter");
        if (showhide_count_btn.value == 'Show Count') {
            showhide_count_btn.value = 'Hide Count';
        }
        else {
            showhide_count_btn.value = 'Show Count';
        }
        RefreshNumberOfDone();
    },false);

    // "Show History/Hide History"ボタン押下時の処理
    document.getElementById("history-show-hide").addEventListener('click', function() {
        let showhide_history_btn = document.getElementById("history-show-hide");
        let bshow = showhide_history_btn.value == 'Show History';
        if (bshow) {
            showhide_history_btn.value = 'Hide History';
        }
        else {
            showhide_history_btn.value = 'Show History';
        }
        let history_data_row = document.getElementsByClassName("history");
        for (let i = 0; i < history_data_row.length; i++) {
            if (bshow) {
                history_data_row[i].style.display = "block";
            }
            else {
                history_data_row[i].style.display = "none";
            }
        }
    }, false);

     // イベント設定
    SetInfinity();
    SetCorrectButton('a');
    SetCorrectButton('b');
    SetIncorrectButton('a','b');
    SetIncorrectButton('b','a');
    SetMemberStatusButton('a','b');
    SetMemberStatusButton('b','a');
    SetDataChangeEvent('a');
    SetDataChangeEvent('b');
    SetMemberNameFitEvent();

    // 画面ロード時の初期処理
    CalcAll();

});
