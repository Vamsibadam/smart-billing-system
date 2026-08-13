import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { login } from "../services/authService";

function Login() {
  const navigate = useNavigate();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();

    try {
      setLoading(true);

      const data = await login(username, password);

      localStorage.setItem("access_token", data.access);
      localStorage.setItem("refresh_token", data.refresh);
      localStorage.setItem("username", data.username);

      navigate("/dashboard");
    } catch (error) {
      alert("Invalid username or password");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="nex-page">

      {/* Background */}
      <div className="page-glow page-glow-orange" />
      <div className="page-glow page-glow-purple" />

      <div className="nex-card">

        {/* =====================================================
            LEFT BRAND PANEL
        ====================================================== */}

        <section className="nex-brand-panel">

          <div className="panel-bg-glow" />
          <div className="panel-grid" />

          {/* Decorative orbit */}
          <div className="orbit orbit-one">
            <span />
          </div>

          <div className="orbit orbit-two">
            <span />
          </div>


          {/* =================================================
              LOGO
          ================================================== */}

          <div className="nex-logo">

            <div className="logo-box">
              <div className="logo-shape">
                <span />
              </div>
            </div>

            <span>
              Nex<span>Bill</span>
            </span>

          </div>


          {/* =================================================
              BRAND TEXT
          ================================================== */}

          <div className="brand-content">

            <div className="brand-label">
              <span />
              NEXBILL
            </div>

            <h1>
              <span>Bill.</span>
              <span>Manage.</span>
              <strong>Grow.</strong>
            </h1>

            <div className="brand-dots">
              <i />
              <i />
              <i />
            </div>

          </div>


          {/* =================================================
              BILLING SOFTWARE SCENE
          ================================================== */}

          <div className="billing-scene">

            {/* Main spotlight */}
            <div className="billing-spotlight" />

            {/* =================================================
                HANGING LIGHT
            ================================================== */}

            <div className="hanging-light">

              <div className="light-wire" />

              <div className="light-cap" />

              <div className="light-bulb">

                <div className="bulb-glass" />

                <div className="bulb-filament">
                  <span />
                  <span />
                </div>

              </div>

              <div className="light-glow" />

            </div>


            {/* =================================================
                BILLING PC
            ================================================== */}

            <div className="billing-pc">

              {/* Monitor glow */}
              <div className="monitor-glow" />

              <div className="monitor">

                {/* Monitor top bar */}

                <div className="monitor-top">

                  <span className="traffic orange" />
                  <span className="traffic yellow" />
                  <span className="traffic green" />

                  <span className="software-name">
                    NEXBILL
                  </span>

                </div>


                {/* =================================================
                    BILLING SOFTWARE UI
                ================================================== */}

                <div className="billing-ui">

                  {/* Sidebar */}

                  <div className="ui-sidebar">

                    <span className="active" />
                    <span />
                    <span />
                    <span />
                    <span />

                  </div>


                  {/* Main billing area */}

                  <div className="ui-main">

                    <div className="ui-heading">
                      Billing
                    </div>


                    {/* Summary */}

                    <div className="ui-summary">

                      <div>
                        <small>
                          Today's Sales
                        </small>

                        <b>
                          ₹24,680
                        </b>
                      </div>

                      <div>
                        <small>
                          Bills
                        </small>

                        <b>
                          128
                        </b>
                      </div>

                    </div>


                    {/* Products */}

                    <div className="bill-row">
                      <span>
                        Chocolate Kulfi
                      </span>

                      <b>
                        ₹120
                      </b>
                    </div>

                    <div className="bill-row">
                      <span>
                        Paneer Sandwich
                      </span>

                      <b>
                        ₹180
                      </b>
                    </div>

                    <div className="bill-row">
                      <span>
                        Chocolate Shake
                      </span>

                      <b>
                        ₹150
                      </b>
                    </div>


                    {/* Total */}

                    <div className="bill-total">

                      <span>
                        Total
                      </span>

                      <b>
                        ₹450
                      </b>

                    </div>

                  </div>

                </div>

              </div>


              {/* =================================================
                  MONITOR STAND
              ================================================== */}

              <div className="monitor-stand" />

              <div className="monitor-base" />


              {/* =================================================
                  KEYBOARD
              ================================================== */}

              <div className="keyboard">

                {Array.from({ length: 24 }).map((_, index) => (
                  <span key={index} />
                ))}

              </div>

            </div>


            {/* =================================================
                SMALL BILLING DECORATIONS
            ================================================== */}

            <div className="floating-item rupee">
              ₹
            </div>

            <div className="floating-item check">
              ✓
            </div>

            <div className="floating-item plus">
              +
            </div>


            {/* Small particles */}

            <span className="scene-particle particle-one" />
            <span className="scene-particle particle-two" />
            <span className="scene-particle particle-three" />

          </div>


          {/* =================================================
              BOTTOM STATUS
          ================================================== */}

          <div className="brand-bottom">

            <span className="status">
              <i />
              SYSTEM READY
            </span>

            <div className="mini-bars">
              <span />
              <span />
              <span />
              <span />
              <span />
              <span />
            </div>

          </div>

        </section>


        {/* =====================================================
            RIGHT LOGIN PANEL
        ====================================================== */}

        <section className="nex-login-panel">

          {/* Mobile logo */}

          <div className="mobile-logo">

            <div className="mobile-logo-box">
              <div />
            </div>

            <span>
              Nex<span>Bill</span>
            </span>

          </div>


          <div className="login-content">

            {/* =================================================
                HEADING
            ================================================== */}

            <div className="login-heading">

              <div className="heading-accent" />

              <p>
                WELCOME BACK
              </p>

              <h2>
                Sign in
              </h2>

              <div className="heading-line" />

            </div>


            {/* =================================================
                LOGIN FORM
            ================================================== */}

            <form onSubmit={handleLogin}>

              {/* Username */}

              <div className="field">

                <label>
                  Username
                </label>

                <div className="input-box">

                  <span className="input-number">
                    01
                  </span>

                  <input
                    type="text"
                    placeholder="Enter your username"
                    value={username}
                    onChange={(e) =>
                      setUsername(e.target.value)
                    }
                    required
                  />

                  <span className="input-indicator" />

                </div>

              </div>


              {/* Password */}

              <div className="field">

                <label>
                  Password
                </label>

                <div className="input-box">

                  <span className="input-number">
                    02
                  </span>

                  <input
                    type="password"
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) =>
                      setPassword(e.target.value)
                    }
                    required
                  />

                  <span className="input-indicator" />

                </div>

              </div>


              {/* Login Button */}

              <button
                type="submit"
                disabled={loading}
                className="login-button"
              >

                <span className="button-bg" />
                <span className="button-shine" />

                <span className="button-content">

                  {loading ? (
                    <>
                      <span className="spinner" />
                      Signing in
                    </>
                  ) : (
                    <>
                      Continue

                      <span className="arrow">
                        →
                      </span>
                    </>
                  )}

                </span>

              </button>

            </form>


            {/* Footer */}

            <div className="login-footer">
              <span />
              <i />
              <span />
            </div>

          </div>

        </section>

      </div>


      {/* =========================================================
          STYLES
      ========================================================== */}

      <style>{`

        * {
          box-sizing: border-box;
        }


        /* =====================================================
           PAGE
        ====================================================== */

        .nex-page {
          min-height: 100vh;
          width: 100%;

          display: flex;
          align-items: center;
          justify-content: center;

          padding: 25px;

          position: relative;
          overflow: hidden;

          background: #eeece7;

          font-family:
            Inter,
            system-ui,
            -apple-system,
            BlinkMacSystemFont,
            "Segoe UI",
            sans-serif;
        }


        .page-glow {
          position: absolute;

          border-radius: 50%;

          pointer-events: none;

          filter: blur(100px);
        }


        .page-glow-orange {
          width: 500px;
          height: 500px;

          top: -250px;
          left: -170px;

          background:
            rgba(249,115,22,.14);

          animation:
            pageFloat
            12s
            ease-in-out
            infinite;
        }


        .page-glow-purple {
          width: 520px;
          height: 520px;

          right: -250px;
          bottom: -250px;

          background:
            rgba(99,102,241,.14);

          animation:
            pageFloat2
            14s
            ease-in-out
            infinite;
        }


        @keyframes pageFloat {

          0%, 100% {
            transform:
              translate(0,0);
          }

          50% {
            transform:
              translate(50px,40px);
          }

        }


        @keyframes pageFloat2 {

          0%, 100% {
            transform:
              translate(0,0);
          }

          50% {
            transform:
              translate(-45px,-40px);
          }

        }


        /* =====================================================
           MAIN CARD
        ====================================================== */

        .nex-card {
          width: 100%;
          max-width: 1080px;

          min-height: 640px;

          display: flex;

          position: relative;
          z-index: 5;

          overflow: hidden;

          border-radius: 35px;

          background: #111315;

          box-shadow:
            0 40px 90px
            rgba(15,23,42,.2);

          animation:
            cardEnter
            .8s
            cubic-bezier(.22,1,.36,1)
            both;
        }


        @keyframes cardEnter {

          from {
            opacity: 0;

            transform:
              translateY(25px)
              scale(.98);
          }

          to {
            opacity: 1;

            transform:
              translateY(0)
              scale(1);
          }

        }


        /* =====================================================
           LEFT PANEL
        ====================================================== */

        .nex-brand-panel {
          width: 55%;

          min-height: 640px;

          padding: 50px;

          position: relative;

          overflow: hidden;

          color: white;

          background:
            #111315;
        }


        .panel-bg-glow {
          position: absolute;

          width: 420px;
          height: 420px;

          right: -170px;
          top: -160px;

          border-radius: 50%;

          background:
            rgba(99,102,241,.1);

          filter: blur(60px);

          animation:
            panelGlow
            8s
            ease-in-out
            infinite;
        }


        .panel-bg-glow::after {
          content: "";

          position: absolute;

          width: 280px;
          height: 280px;

          left: -350px;
          top: 380px;

          border-radius: 50%;

          background:
            rgba(249,115,22,.1);

          filter: blur(50px);
        }


        @keyframes panelGlow {

          0%,100% {
            transform:
              scale(1);

            opacity: .6;
          }

          50% {
            transform:
              scale(1.25);

            opacity: 1;
          }

        }


        /* =====================================================
           GRID
        ====================================================== */

        .panel-grid {
          position: absolute;

          inset: 0;

          opacity: .025;

          background-image:
            linear-gradient(
              rgba(255,255,255,.2) 1px,
              transparent 1px
            ),
            linear-gradient(
              90deg,
              rgba(255,255,255,.2) 1px,
              transparent 1px
            );

          background-size: 48px 48px;

          animation:
            gridMove
            18s
            linear
            infinite;
        }


        @keyframes gridMove {

          from {
            background-position:
              0 0;
          }

          to {
            background-position:
              48px 48px;
          }

        }


        /* =====================================================
           ORBITS
        ====================================================== */

        .orbit {
          position: absolute;

          border:
            1px solid
            rgba(255,255,255,.045);

          border-radius: 50%;

          pointer-events: none;
        }


        .orbit-one {
          width: 360px;
          height: 360px;

          right: -190px;
          top: -120px;

          animation:
            orbit
            18s
            linear
            infinite;
        }


        .orbit-two {
          width: 250px;
          height: 250px;

          right: -135px;
          top: -65px;

          animation:
            orbit
            12s
            linear
            infinite
            reverse;
        }


        .orbit span {
          position: absolute;

          width: 5px;
          height: 5px;

          border-radius: 50%;

          top: 15px;
          left: 50%;

          background: #f97316;

          box-shadow:
            0 0 14px
            rgba(249,115,22,.8);
        }


        .orbit-two span {
          background: #6366f1;

          box-shadow:
            0 0 14px
            rgba(99,102,241,.8);
        }


        @keyframes orbit {

          from {
            transform:
              rotate(0deg);
          }

          to {
            transform:
              rotate(360deg);
          }

        }


        /* =====================================================
           LOGO
        ====================================================== */

        .nex-logo {
          position: relative;

          z-index: 20;

          display: flex;

          align-items: center;

          gap: 12px;

          font-size: 22px;

          font-weight: 750;

          letter-spacing: -.04em;
        }


        .nex-logo > span span {
          color: #fb923c;
        }


        .logo-box {
          width: 43px;
          height: 43px;

          display: flex;

          align-items: center;
          justify-content: center;

          border-radius: 13px;

          background: #fafafa;

          animation:
            logoPulse
            4s
            ease-in-out
            infinite;
        }


        .logo-shape {
          width: 21px;
          height: 21px;

          position: relative;

          border-radius: 6px;

          background:
            linear-gradient(
              135deg,
              #f97316,
              #6366f1
            );

          transform:
            rotate(45deg);

          animation:
            logoRotate
            7s
            ease-in-out
            infinite;
        }


        .logo-shape span {
          position: absolute;

          width: 7px;
          height: 7px;

          left: 7px;
          top: 7px;

          border-radius: 50%;

          background: white;
        }


        @keyframes logoRotate {

          0%,100% {
            transform:
              rotate(45deg)
              scale(1);
          }

          50% {
            transform:
              rotate(135deg)
              scale(1.08);
          }

        }


        @keyframes logoPulse {

          0%,100% {
            box-shadow:
              0 0 0
              rgba(249,115,22,0);
          }

          50% {
            box-shadow:
              0 0 0 7px
              rgba(249,115,22,.025);
          }

        }


        /* =====================================================
           BRAND TEXT
        ====================================================== */

        .brand-content {
          position: relative;

          z-index: 20;

          margin-top: 95px;
        }


        .brand-label {
          display: flex;

          align-items: center;

          gap: 11px;

          margin-bottom: 23px;

          color: #64748b;

          font-size: 9px;

          font-weight: 800;

          letter-spacing: .3em;
        }


        .brand-label span {
          width: 32px;
          height: 2px;

          border-radius: 5px;

          background:
            linear-gradient(
              90deg,
              #f97316,
              #6366f1
            );
        }


        .brand-content h1 {
          margin: 0;

          font-size:
            clamp(50px,6vw,72px);

          line-height: .87;

          letter-spacing: -.065em;
        }


        .brand-content h1 span,
        .brand-content h1 strong {
          display: block;
        }


        .brand-content h1 span:first-child {
          color: white;

          animation:
            wordIn
            .7s
            .2s
            both;
        }


        .brand-content h1 span:nth-child(2) {
          color: #4b5563;

          animation:
            wordIn
            .7s
            .35s
            both;
        }


        .brand-content h1 strong {
          font-weight: 750;

          background:
            linear-gradient(
              100deg,
              #f97316,
              #fb923c,
              #818cf8
            );

          background-clip: text;
          -webkit-background-clip: text;

          color: transparent;

          animation:
            wordIn
            .7s
            .5s
            both,

            gradientMove
            5s
            linear
            infinite;
        }


        @keyframes wordIn {

          from {
            opacity: 0;

            transform:
              translateX(-20px);

            filter:
              blur(5px);
          }

          to {
            opacity: 1;

            transform:
              translateX(0);

            filter:
              blur(0);
          }

        }


        @keyframes gradientMove {

          from {
            background-position: 0%;
          }

          to {
            background-position: 200%;
          }

        }


        .brand-dots {
          display: flex;

          gap: 7px;

          margin-top: 27px;
        }


        .brand-dots i {
          width: 7px;
          height: 7px;

          border-radius: 50%;

          background: #f97316;

          animation:
            dotPulse
            2s
            ease-in-out
            infinite;
        }


        .brand-dots i:nth-child(2) {
          opacity: .45;

          animation-delay:
            .2s;
        }


        .brand-dots i:nth-child(3) {
          background: #6366f1;

          animation-delay:
            .4s;
        }


        @keyframes dotPulse {

          0%,100% {
            transform:
              scale(1);
          }

          50% {
            transform:
              scale(1.6);
          }

        }


        /* =====================================================
           BILLING SCENE
        ====================================================== */

        .billing-scene {
          position: absolute;

          width: 440px;
          height: 330px;

          right: -5px;
          bottom: 55px;

          z-index: 10;

          pointer-events: none;

          animation:
            sceneEnter
            .9s
            .4s
            cubic-bezier(.22,1,.36,1)
            both;
        }


        @keyframes sceneEnter {

          from {
            opacity: 0;

            transform:
              translateY(25px)
              scale(.94);
          }

          to {
            opacity: 1;

            transform:
              translateY(0)
              scale(1);
          }

        }


        /* =====================================================
           BILLING SPOTLIGHT
        ====================================================== */

        .billing-spotlight {
          position: absolute;

          width: 340px;
          height: 260px;

          left: 65px;
          top: 45px;

          border-radius: 50%;

          background:
            radial-gradient(
              ellipse at center,
              rgba(249,115,22,.22) 0%,
              rgba(249,115,22,.11) 27%,
              rgba(249,115,22,.035) 52%,
              transparent 72%
            );

          filter: blur(15px);

          opacity: .18;

          transform:
            scale(.8);

          transition:
            opacity .7s ease,
            transform .8s cubic-bezier(.22,1,.36,1),
            filter .7s ease;

          animation:
            spotlightBreath
            5s
            ease-in-out
            infinite;
        }


        /*
         * INPUT FOCUS:
         * Spotlight becomes strong and focuses on PC.
         */

        .nex-card:has(.input-box input:focus)
        .billing-spotlight {

          opacity: 1;

          transform:
            scale(1.2);

          filter:
            blur(8px);
        }


        @keyframes spotlightBreath {

          0%,100% {
            opacity: .15;
          }

          50% {
            opacity: .24;
          }

        }


        /* =====================================================
           HANGING LIGHT
        ====================================================== */

        .hanging-light {
          position: absolute;

          width: 80px;
          height: 150px;

          left: 265px;
          top: -20px;

          z-index: 20;

          transform-origin:
            top center;

          animation:
            lampSwing
            5s
            ease-in-out
            infinite;
        }


        @keyframes lampSwing {

          0%,100% {
            transform:
              rotate(1deg);
          }

          50% {
            transform:
              rotate(-2deg);
          }

        }


        /* Wire */

        .light-wire {
          position: absolute;

          width: 2px;
          height: 62px;

          left: 39px;
          top: 0;

          background:
            #383d44;
        }


        /* Cap */

        .light-cap {
          position: absolute;

          width: 34px;
          height: 13px;

          left: 23px;
          top: 59px;

          border-radius:
            10px
            10px
            4px
            4px;

          background:
            linear-gradient(
              180deg,
              #444a52,
              #22262b
            );

          box-shadow:
            0 5px 10px
            rgba(0,0,0,.2);
        }


        /* Bulb */

        .light-bulb {
          position: absolute;

          width: 30px;
          height: 43px;

          left: 25px;
          top: 66px;

          border-radius:
            50%
            50%
            45%
            45%;

          background:
            rgba(255,255,255,.08);

          border:
            1px solid
            rgba(255,255,255,.12);

          transition:
            background .5s ease,
            box-shadow .6s ease;
        }


        .bulb-glass {
          position: absolute;

          width: 19px;
          height: 25px;

          left: 5px;
          top: 4px;

          border-radius: 50%;

          background:
            rgba(255,255,255,.12);

          transition:
            background .5s ease;
        }


        /* =====================================================
           FILAMENT
        ====================================================== */

        .bulb-filament {
          position: absolute;

          width: 10px;
          height: 14px;

          left: 9px;
          top: 9px;
        }


        .bulb-filament span {
          position: absolute;

          width: 7px;
          height: 9px;

          border-left:
            1px solid
            rgba(255,255,255,.3);

          border-bottom:
            1px solid
            rgba(255,255,255,.3);

          border-radius: 0 0 5px 5px;
        }


        .bulb-filament span:first-child {
          left: 0;
        }


        .bulb-filament span:last-child {
          right: 0;

          transform:
            scaleX(-1);
        }


        /* =====================================================
           BULB LIGHT STATE
        ====================================================== */

        .nex-card:has(.input-box input:focus)
        .light-bulb {

          background:
            rgba(255,184,77,.9);

          border-color:
            rgba(255,190,90,.8);

          box-shadow:
            0 0 15px
            rgba(255,180,60,.8),

            0 0 45px
            rgba(255,160,40,.55),

            0 0 85px
            rgba(249,115,22,.3);
        }


        .nex-card:has(.input-box input:focus)
        .bulb-glass {

          background:
            rgba(255,244,200,.95);
        }


        .nex-card:has(.input-box input:focus)
        .bulb-filament span {

          border-color:
            #fff8d8;

          box-shadow:
            0 0 7px
            #fff3bd;
        }


        /* =====================================================
           BILLING PC
        ====================================================== */

        .billing-pc {
          position: absolute;

          width: 190px;
          height: 150px;

          left: 195px;
          bottom: 45px;

          z-index: 15;

          transition:
            transform .7s
            cubic-bezier(.22,1,.36,1);
        }


        /*
         * PC reacts when login input is focused.
         */

        .nex-card:has(.input-box input:focus)
        .billing-pc {

          transform:
            translateY(-5px)
            scale(1.025);
        }


        /* =====================================================
           MONITOR GLOW
        ====================================================== */

        .monitor-glow {
          position: absolute;

          width: 180px;
          height: 120px;

          left: 5px;
          top: -10px;

          border-radius: 50%;

          background:
            radial-gradient(
              ellipse,
              rgba(99,102,241,.14),
              transparent 70%
            );

          filter: blur(18px);

          opacity: .5;

          transition:
            opacity .5s ease;
        }


        .nex-card:has(.input-box input:focus)
        .monitor-glow {

          opacity: 1;
        }


        /* =====================================================
           MONITOR
        ====================================================== */

        .monitor {
          position: absolute;

          width: 150px;
          height: 97px;

          left: 15px;
          top: 0;

          overflow: hidden;

          border-radius: 9px;

          border:
            2px solid
            #303640;

          background:
            #0e1116;

          transition:
            border-color .6s ease,
            box-shadow .6s ease;
        }


        .nex-card:has(.input-box input:focus)
        .monitor {

          border-color:
            rgba(249,115,22,.55);

          box-shadow:
            0 0 30px
            rgba(249,115,22,.16),

            inset 0 0 20px
            rgba(99,102,241,.07);
        }


        /* =====================================================
           MONITOR TOP
        ====================================================== */

        .monitor-top {
          height: 16px;

          display: flex;

          align-items: center;

          gap: 4px;

          padding:
            0 7px;

          background:
            #171b21;
        }


        .traffic {
          width: 4px;
          height: 4px;

          border-radius: 50%;
        }


        .traffic.orange {
          background: #f97316;
        }


        .traffic.yellow {
          background: #fbbf24;
        }


        .traffic.green {
          background: #34d399;
        }


        .software-name {
          margin-left: auto;

          color: #64748b;

          font-size: 5px;

          font-weight: 800;

          letter-spacing: .13em;
        }


        /* =====================================================
           BILLING UI
        ====================================================== */

        .billing-ui {
          display: flex;

          height:
            calc(100% - 16px);
        }


        .ui-sidebar {
          width: 26px;

          padding-top: 8px;

          display: flex;

          flex-direction: column;

          align-items: center;

          gap: 7px;

          background:
            #12161c;
        }


        .ui-sidebar span {
          width: 9px;
          height: 5px;

          border-radius: 2px;

          background:
            #303640;
        }


        .ui-sidebar span.active {
          background:
            #f97316;

          box-shadow:
            0 0 8px
            rgba(249,115,22,.55);
        }


        .ui-main {
          flex: 1;

          padding:
            7px 8px;

          position: relative;
        }


        .ui-heading {
          color: white;

          font-size: 7px;

          font-weight: 700;
        }


        .ui-summary {
          display: flex;

          gap: 6px;

          margin-top: 5px;
        }


        .ui-summary > div {
          flex: 1;

          padding: 4px;

          border-radius: 4px;

          background:
            rgba(255,255,255,.04);
        }


        .ui-summary small {
          display: block;

          color: #64748b;

          font-size: 4px;
        }


        .ui-summary b {
          color: #fb923c;

          font-size: 6px;
        }


        .bill-row {
          display: flex;

          justify-content: space-between;

          margin-top: 5px;

          padding-bottom: 3px;

          border-bottom:
            1px solid
            rgba(255,255,255,.04);

          color: #64748b;

          font-size: 4.5px;
        }


        .bill-row b {
          color: #cbd5e1;
        }


        .bill-total {
          display: flex;

          justify-content: space-between;

          margin-top: 5px;

          color: #94a3b8;

          font-size: 5px;
        }


        .bill-total b {
          color: #34d399;

          animation:
            totalPulse
            2s
            ease-in-out
            infinite;
        }


        @keyframes totalPulse {

          0%,100% {
            opacity: .65;
          }

          50% {
            opacity: 1;
          }

        }


        /* =====================================================
           MONITOR STAND
        ====================================================== */

        .monitor-stand {
          position: absolute;

          width: 8px;
          height: 20px;

          left: 86px;
          top: 97px;

          background:
            #2c3239;
        }


        .monitor-base {
          position: absolute;

          width: 60px;
          height: 7px;

          left: 60px;
          top: 115px;

          border-radius: 5px;

          background:
            #2c3239;
        }


        /* =====================================================
           KEYBOARD
        ====================================================== */

        .keyboard {
          position: absolute;

          width: 105px;
          height: 18px;

          left: 38px;
          bottom: 1px;

          padding: 3px;

          display: grid;

          grid-template-columns:
            repeat(8, 1fr);

          gap: 2px;

          border-radius: 4px;

          background:
            #242a31;

          transform:
            perspective(100px)
            rotateX(18deg);
        }


        .keyboard span {
          border-radius: 1px;

          background:
            #3a414b;

          animation:
            keyPulse
            3s
            ease-in-out
            infinite;
        }


        .keyboard span:nth-child(4n) {
          animation-delay:
            .4s;
        }


        @keyframes keyPulse {

          0%,100% {
            opacity: .65;
          }

          50% {
            opacity: 1;
          }

        }


        /* =====================================================
           FLOATING BILLING ELEMENTS
        ====================================================== */

        .floating-item {
          position: absolute;

          width: 29px;
          height: 29px;

          display: flex;

          align-items: center;
          justify-content: center;

          border-radius: 9px;

          background:
            rgba(255,255,255,.045);

          border:
            1px solid
            rgba(255,255,255,.07);

          backdrop-filter:
            blur(8px);

          font-size: 12px;

          font-weight: 800;
        }


        .rupee {
          right: 78px;
          top: 65px;

          color: #fb923c;

          animation:
            floatingOne
            4s
            ease-in-out
            infinite;
        }


        .check {
          right: 10px;
          top: 150px;

          color: #34d399;

          animation:
            floatingTwo
            4.5s
            ease-in-out
            infinite;
        }


        .plus {
          left: 35px;
          top: 125px;

          color: #818cf8;

          animation:
            floatingOne
            5s
            ease-in-out
            infinite;
        }


        @keyframes floatingOne {

          0%,100% {
            transform:
              translateY(0)
              rotate(0deg);

            opacity: .4;
          }

          50% {
            transform:
              translateY(-11px)
              rotate(6deg);

            opacity: 1;
          }

        }


        @keyframes floatingTwo {

          0%,100% {
            transform:
              translateY(0);
          }

          50% {
            transform:
              translateY(10px)
              rotate(-5deg);
          }

        }


        /* =====================================================
           PARTICLES
        ====================================================== */

        .scene-particle {
          position: absolute;

          width: 4px;
          height: 4px;

          border-radius: 50%;
        }


        .particle-one {
          left: 165px;
          top: 90px;

          background: #f97316;

          animation:
            particleFloat
            4s
            ease-in-out
            infinite;
        }


        .particle-two {
          right: 110px;
          top: 185px;

          background: #6366f1;

          animation:
            particleFloat
            5s
            .5s
            ease-in-out
            infinite;
        }


        .particle-three {
          left: 180px;
          bottom: 35px;

          background: #34d399;

          animation:
            particleFloat
            4.5s
            1s
            ease-in-out
            infinite;
        }


        @keyframes particleFloat {

          0%,100% {
            transform:
              translate(0,0)
              scale(1);

            opacity: .2;
          }

          50% {
            transform:
              translate(12px,-15px)
              scale(1.5);

            opacity: .9;
          }

        }


        /* =====================================================
           BRAND BOTTOM
        ====================================================== */

        .brand-bottom {
          position: absolute;

          left: 50px;
          right: 50px;
          bottom: 28px;

          z-index: 20;

          display: flex;

          align-items: center;

          justify-content: space-between;
        }


        .status {
          display: flex;

          align-items: center;

          gap: 8px;

          color: #4b5563;

          font-size: 8px;

          font-weight: 800;

          letter-spacing: .15em;
        }


        .status i {
          width: 5px;
          height: 5px;

          border-radius: 50%;

          background: #34d399;

          box-shadow:
            0 0 9px
            rgba(52,211,153,.6);

          animation:
            statusPulse
            2s
            ease-in-out
            infinite;
        }


        @keyframes statusPulse {

          0%,100% {
            opacity: .4;
          }

          50% {
            opacity: 1;
          }

        }


        .mini-bars {
          height: 28px;

          display: flex;

          align-items: flex-end;

          gap: 4px;
        }


        .mini-bars span {
          width: 3px;

          border-radius: 5px;

          background: #2c3035;

          animation:
            bars
            2.3s
            ease-in-out
            infinite;
        }


        .mini-bars span:nth-child(1) {
          height: 7px;
        }

        .mini-bars span:nth-child(2) {
          height: 13px;
        }

        .mini-bars span:nth-child(3) {
          height: 10px;
        }

        .mini-bars span:nth-child(4) {
          height: 20px;
          background: #f97316;
        }

        .mini-bars span:nth-child(5) {
          height: 15px;
        }

        .mini-bars span:nth-child(6) {
          height: 25px;
          background: #6366f1;
        }


        @keyframes bars {

          0%,100% {
            transform:
              scaleY(1);
          }

          50% {
            transform:
              scaleY(1.3);
          }

        }


        /* =====================================================
           RIGHT LOGIN
        ====================================================== */

        .nex-login-panel {
          width: 45%;

          min-height: 640px;

          padding: 55px;

          display: flex;

          align-items: center;

          position: relative;

          background:
            #f9f9f7;
        }


        .login-content {
          width: 100%;

          max-width: 360px;

          margin: auto;
        }


        /* =====================================================
           HEADING
        ====================================================== */

        .login-heading {
          margin-bottom: 38px;
        }


        .heading-accent {
          width: 30px;
          height: 4px;

          border-radius: 5px;

          margin-bottom: 20px;

          background:
            linear-gradient(
              90deg,
              #f97316,
              #6366f1
            );
        }


        .login-heading p {
          margin:
            0 0 7px;

          color: #f97316;

          font-size: 10px;

          font-weight: 800;

          letter-spacing: .2em;
        }


        .login-heading h2 {
          margin: 0;

          color: #111315;

          font-size: 42px;

          line-height: 1;

          letter-spacing: -.06em;

          font-weight: 750;
        }


        .heading-line {
          height: 1px;

          width: 100%;

          margin-top: 24px;

          background: #e5e7eb;
        }


        /* =====================================================
           INPUT FIELDS
        ====================================================== */

        .field {
          margin-bottom: 20px;
        }


        .field label {
          display: block;

          margin-bottom: 8px;

          color: #64748b;

          font-size: 10px;

          font-weight: 800;

          letter-spacing: .16em;

          text-transform: uppercase;
        }


        .input-box {
          height: 59px;

          display: flex;

          align-items: center;

          position: relative;

          overflow: hidden;

          background: white;

          border:
            1px solid
            #e2e5e8;

          border-radius: 15px;

          transition:
            border-color .3s ease,
            box-shadow .3s ease,
            transform .3s ease;
        }


        .input-box::after {
          content: "";

          position: absolute;

          left: 0;
          bottom: 0;

          width: 0;
          height: 2px;

          background:
            linear-gradient(
              90deg,
              #f97316,
              #6366f1
            );

          transition:
            width .4s ease;
        }


        .input-box:focus-within {

          border-color:
            #cbd5e1;

          transform:
            translateY(-1px);

          box-shadow:
            0 10px 30px
            rgba(15,23,42,.07);
        }


        .input-box:focus-within::after {
          width: 100%;
        }


        .input-number {
          width: 43px;

          text-align: center;

          color: #cbd5e1;

          font-size: 9px;

          font-weight: 800;

          border-right:
            1px solid
            #eef0f2;
        }


        .input-box input {
          flex: 1;

          height: 100%;

          padding:
            0 14px;

          border: 0;
          outline: 0;

          background: transparent;

          color: #111827;

          font-size: 14px;
        }


        .input-box input::placeholder {
          color: #c4c9d0;
        }


        .input-indicator {
          width: 5px;
          height: 5px;

          margin-right: 17px;

          border-radius: 50%;

          background: #d9dde1;

          transition:
            background .3s ease,
            box-shadow .3s ease;
        }


        .input-box:focus-within
        .input-indicator {

          background:
            #f97316;

          box-shadow:
            0 0 0 4px
            rgba(249,115,22,.1);
        }


        /* =====================================================
           BUTTON
        ====================================================== */

        .login-button {
          width: 100%;

          height: 59px;

          margin-top: 10px;

          position: relative;

          overflow: hidden;

          border: 0;

          border-radius: 15px;

          cursor: pointer;

          color: white;

          background: #111315;

          transition:
            transform .3s ease,
            box-shadow .3s ease;
        }


        .button-bg {
          position: absolute;

          inset: 0;

          background:
            linear-gradient(
              110deg,
              #f97316,
              #fb923c,
              #6366f1
            );

          background-size:
            200% 100%;

          opacity: 0;

          transition:
            opacity .3s ease;

          animation:
            buttonGradient
            4s
            linear
            infinite;
        }


        .login-button:hover {

          transform:
            translateY(-2px);

          box-shadow:
            0 15px 35px
            rgba(15,23,42,.15);
        }


        .login-button:hover
        .button-bg {
          opacity: 1;
        }


        .button-shine {
          position: absolute;

          width: 55%;
          height: 100%;

          left: -100%;
          top: 0;

          background:
            linear-gradient(
              90deg,
              transparent,
              rgba(255,255,255,.2),
              transparent
            );

          transform:
            skewX(-20deg);

          animation:
            shine
            4s
            1s
            ease-in-out
            infinite;
        }


        @keyframes buttonGradient {

          from {
            background-position: 0%;
          }

          to {
            background-position: 200%;
          }

        }


        @keyframes shine {

          0% {
            left: -100%;
          }

          25%,100% {
            left: 150%;
          }

        }


        .button-content {
          position: relative;

          z-index: 5;

          height: 100%;

          display: flex;

          align-items: center;

          justify-content: center;

          gap: 12px;

          font-size: 13px;

          font-weight: 700;
        }


        .arrow {
          width: 27px;
          height: 27px;

          display: flex;

          align-items: center;
          justify-content: center;

          border-radius: 50%;

          background:
            rgba(255,255,255,.1);

          transition:
            transform .3s ease;
        }


        .login-button:hover
        .arrow {
          transform:
            translateX(4px);
        }


        .spinner {
          width: 16px;
          height: 16px;

          border:
            2px solid
            rgba(255,255,255,.3);

          border-top-color:
            white;

          border-radius: 50%;

          animation:
            spin
            .7s
            linear
            infinite;
        }


        @keyframes spin {

          to {
            transform:
              rotate(360deg);
          }

        }


        /* =====================================================
           FOOTER
        ====================================================== */

        .login-footer {
          display: flex;

          align-items: center;

          gap: 10px;

          margin-top: 32px;
        }


        .login-footer span {
          flex: 1;

          height: 1px;

          background: #e5e7eb;
        }


        .login-footer i {
          width: 5px;
          height: 5px;

          border-radius: 50%;

          background: #f97316;

          animation:
            footerPulse
            2s
            ease-in-out
            infinite;
        }


        @keyframes footerPulse {

          0%,100% {
            transform:
              scale(1);
          }

          50% {
            transform:
              scale(1.5);
          }

        }


        /* =====================================================
           MOBILE LOGO
        ====================================================== */

        .mobile-logo {
          display: none;
        }


        /* =====================================================
           TABLET
        ====================================================== */

        @media (max-width: 900px) {

          .nex-brand-panel {
            width: 50%;
            padding: 40px;
          }

          .nex-login-panel {
            width: 50%;
            padding: 40px;
          }

          /* Keep the complete billing scene inside the panel */
          .billing-scene {
            right: 0;
            bottom: 25px;
            transform: scale(.72);
            transform-origin: bottom right;
          }

          .brand-content {
            margin-top: 70px;
          }

          .brand-content h1 {
            font-size: 52px;
          }

        }


        /* =====================================================
           MOBILE
        ====================================================== */

        @media (max-width: 767px) {

          .nex-page {
            min-height: 100svh;
            padding: 10px;
            align-items: flex-start;
            overflow-x: hidden;
            overflow-y: auto;
          }

          .nex-card {
            width: 100%;
            flex-direction: column;
            min-height: auto;
            border-radius: 25px;
            overflow: hidden;
          }

          /* =====================================================
             MOBILE LEFT BRAND PANEL
          ====================================================== */

          .nex-brand-panel {
            width: 100%;
            min-height: 245px;
            height: 245px;
            padding: 25px;
            position: relative;
            overflow: hidden;
          }

          .nex-logo {
            display: none;
          }

          .brand-content {
            margin-top: 42px;
            position: relative;
            z-index: 30;
          }

          .brand-content h1 {
            font-size: 42px;
          }

          /*
             Keep the complete billing scene inside the card.
             The PC, lamp and bulb themselves are NOT changed.
          */
          .billing-scene {
            width: 440px;
            height: 330px;
            right: -15px;
            bottom: -15px;
            transform: scale(.67);
            transform-origin: bottom right;
            z-index: 10;
          }

          .billing-spotlight {
            width: 340px;
            height: 260px;
          }

          .brand-bottom {
            display: none;
          }

          /* =====================================================
             MOBILE LOGIN
          ====================================================== */

          .nex-login-panel {
            width: 100%;
            min-height: 430px;
            padding: 75px 25px 30px;
            align-items: flex-start;
          }

          .mobile-logo {
            display: flex;
            position: absolute;
            top: 24px;
            left: 25px;
            align-items: center;
            gap: 9px;
            font-size: 19px;
            font-weight: 750;
            letter-spacing: -.04em;
            color: #111315;
          }

          .mobile-logo > span span {
            color: #f97316;
          }

          .mobile-logo-box {
            width: 28px;
            height: 28px;
            display: flex;
            align-items: center;
            justify-content: center;
            border-radius: 8px;
            background: #111315;
          }

          .mobile-logo-box div {
            width: 12px;
            height: 12px;
            border-radius: 4px;
            background: linear-gradient(135deg, #f97316, #6366f1);
            transform: rotate(45deg);
          }

          .login-heading h2 {
            font-size: 36px;
          }

          .input-box,
          .login-button {
            height: 56px;
          }

        }


        /* =====================================================
           SMALL PHONES
        ====================================================== */

        @media (max-width: 390px) {

          .nex-page {
            padding: 8px;
          }

          .nex-brand-panel {
            min-height: 220px;
            height: 220px;
            padding: 22px;
          }

          .brand-content {
            margin-top: 38px;
          }

          .brand-content h1 {
            font-size: 37px;
          }

          /* Keep the complete scene visible on small phones */
          .billing-scene {
            width: 440px;
            height: 330px;
            right: -5px;
            bottom: -15px;
            transform: scale(.56);
            transform-origin: bottom right;
          }

          .nex-login-panel {
            padding: 70px 20px 25px;
          }

          .mobile-logo {
            left: 20px;
          }

        }


        @media (prefers-reduced-motion: reduce) {

          *,
          *::before,
          *::after {

            animation-duration:
              .01ms !important;

            animation-iteration-count:
              1 !important;

            transition-duration:
              .01ms !important;
          }

        }

      `}</style>

    </div>
  );
}

export default Login;